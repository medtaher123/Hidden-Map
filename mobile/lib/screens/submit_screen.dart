import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:mobile/services/file_service.dart';
import 'package:provider/provider.dart';
import '../models/location.dart';
import '../models/location_category.dart';
import '../models/media_file.dart';
import '../providers/locations_provider.dart';
import '../providers/auth_provider.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';

class SubmitScreen extends StatefulWidget {
  const SubmitScreen({super.key});

  @override
  State<SubmitScreen> createState() => _SubmitScreenState();
}

class _SubmitScreenState extends State<SubmitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _latitudeController = TextEditingController();
  final _longitudeController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _photoUrlController = TextEditingController();
  final _photoCaptionController = TextEditingController();
  final List<XFile> _selectedImages = [];
  final ImagePicker _picker = ImagePicker();

  LocationCategory _selectedCategory = LocationCategory.other;
  bool _isSubmitting = false;
  bool _submitted = false;

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _latitudeController.dispose();
    _longitudeController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _photoUrlController.dispose();
    _photoCaptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final List<XFile> picked = await _picker.pickMultiImage();
    if (picked.isEmpty) return;
    setState(() => _selectedImages.addAll(picked));
  }

  void _removeImage(int index) {
    setState(() => _selectedImages.removeAt(index));
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedImages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one image')),
      );
      return;
    }
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please login to submit locations'),
            backgroundColor: Colors.orange,
          ),
        );
      }
      return;
    }

    final fileService = FileService(token: authProvider.token);
    setState(() => _isSubmitting = true);

    try {
      final List<MediaFile> uploadedFiles = [];
      for (final file in _selectedImages) {
        final mediaFile = await fileService.uploadFile(file);
        uploadedFiles.add(mediaFile);
      }
      final location = Location(
        id: '', // Will be set by backend
        name: _nameController.text,
        description: _descriptionController.text,
        category: _selectedCategory,
        latitude: double.parse(_latitudeController.text),
        longitude: double.parse(_longitudeController.text),
        address: _addressController.text,
        city: _cityController.text,
        photos: uploadedFiles,
        submittedById: authProvider.currentUser!.id,
      );

      await context.read<LocationsProvider>().addLocation(location);

      setState(() {
        _submitted = true;
        _isSubmitting = false;
      });

      // Scroll to top
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Scrollable.ensureVisible(
          context,
          duration: const Duration(milliseconds: 300),
        );
      });

      // Reset form after delay
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          setState(() => _submitted = false);
          _formKey.currentState!.reset();
          _nameController.clear();
          _descriptionController.clear();
          _latitudeController.clear();
          _longitudeController.clear();
          _addressController.clear();
          _cityController.clear();
          _photoUrlController.clear();
          _photoCaptionController.clear();
          _selectedCategory = LocationCategory.other;
          _selectedImages.clear();
        }
      });
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Submit Location')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_submitted)
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    border: Border.all(color: Colors.green),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.green),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Location submitted successfully!',
                          style: TextStyle(color: Colors.green),
                        ),
                      ),
                    ],
                  ),
                ),
              _buildTextField(
                controller: _nameController,
                label: 'Location Name',
                icon: Icons.place,
                validator: (val) {
                  if (val == null || val.isEmpty) return 'Name is required';
                  if (val.length < 3)
                    return 'Name must be at least 3 characters';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _descriptionController,
                label: 'Description',
                icon: Icons.description,
                maxLines: 3,
                validator: (val) {
                  if (val == null || val.isEmpty)
                    return 'Description is required';
                  if (val.length < 10)
                    return 'Description must be at least 10 characters';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<LocationCategory>(
                initialValue: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.category),
                ),
                items: LocationCategory.values.map((category) {
                  return DropdownMenuItem(
                    value: category,
                    child: Row(
                      children: [
                        Text(
                          category.emoji,
                          style: const TextStyle(fontSize: 20),
                        ),
                        const SizedBox(width: 8),
                        Text(category.displayName),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedCategory = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _latitudeController,
                      label: 'Latitude',
                      icon: Icons.my_location,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) return 'Required';
                        final lat = double.tryParse(val);
                        if (lat == null || lat < -90 || lat > 90) {
                          return 'Invalid latitude';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTextField(
                      controller: _longitudeController,
                      label: 'Longitude',
                      icon: Icons.explore,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) return 'Required';
                        final lng = double.tryParse(val);
                        if (lng == null || lng < -180 || lng > 180) {
                          return 'Invalid longitude';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _addressController,
                label: 'Address',
                icon: Icons.home,
                validator: (val) {
                  if (val == null || val.isEmpty) return 'Address is required';
                  if (val.length < 5)
                    return 'Address must be at least 5 characters';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _cityController,
                label: 'City',
                icon: Icons.location_city,
                validator: (val) {
                  if (val == null || val.isEmpty) return 'City is required';
                  if (val.length < 2)
                    return 'City must be at least 2 characters';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  children: [
                    if (_selectedImages.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${_selectedImages.length} photo(s) selected',
                                  style: Theme.of(context).textTheme.titleSmall,
                                ),
                                TextButton.icon(
                                  onPressed: _pickImages,
                                  icon: const Icon(
                                    Icons.add_photo_alternate,
                                    size: 20,
                                  ),
                                  label: const Text('Add more'),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            SizedBox(
                              height: 120,
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: _selectedImages.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(width: 8),
                                itemBuilder: (context, index) {
                                  final file = _selectedImages[index];
                                  return Stack(
                                    clipBehavior: Clip.none,
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(8),
                                        child: kIsWeb
                                            ? Image.network(
                                                file.path,
                                                width: 120,
                                                height: 120,
                                                fit: BoxFit.cover,
                                              )
                                            : Image.file(
                                                File(file.path),
                                                width: 120,
                                                height: 120,
                                                fit: BoxFit.cover,
                                              ),
                                      ),
                                      Positioned(
                                        top: -4,
                                        right: -4,
                                        child: IconButton(
                                          padding: EdgeInsets.zero,
                                          constraints: const BoxConstraints(
                                            minWidth: 28,
                                            minHeight: 28,
                                          ),
                                          icon: const Icon(
                                            Icons.close,
                                            color: Colors.red,
                                            size: 20,
                                          ),
                                          style: IconButton.styleFrom(
                                            backgroundColor: Colors.white,
                                          ),
                                          onPressed: () => _removeImage(index),
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      ListTile(
                        leading: const Icon(
                          Icons.add_photo_alternate,
                          size: 40,
                          color: Colors.grey,
                        ),
                        title: const Text('Add Photos'),
                        subtitle: const Text(
                          'Tap to select one or more from gallery',
                        ),
                        onTap: _pickImages,
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _photoCaptionController,
                label: 'Photo Caption (Optional)',
                icon: Icons.text_fields,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitForm,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Submit Location',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        prefixIcon: Icon(icon),
      ),
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
    );
  }
}
