import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/location.dart';
import '../models/photo.dart';
import '../models/location_category.dart';
import '../providers/locations_provider.dart';
import '../providers/auth_provider.dart';

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

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

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

    setState(() => _isSubmitting = true);

    try {
      final location = Location(
        id: '', // Will be set by backend
        name: _nameController.text,
        description: _descriptionController.text,
        category: _selectedCategory,
        latitude: double.parse(_latitudeController.text),
        longitude: double.parse(_longitudeController.text),
        address: _addressController.text,
        city: _cityController.text,
        photos: [
          Photo(
            id: '',
            url: _photoUrlController.text,
            thumbnailUrl: _photoUrlController.text,
            caption: _photoCaptionController.text.isEmpty
                ? null
                : _photoCaptionController.text,
          ),
        ],
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
              _buildTextField(
                controller: _photoUrlController,
                label: 'Photo URL',
                icon: Icons.photo,
                validator: (val) {
                  if (val == null || val.isEmpty)
                    return 'Photo URL is required';
                  if (!val.startsWith('http')) return 'Must be a valid URL';
                  return null;
                },
              ),
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
