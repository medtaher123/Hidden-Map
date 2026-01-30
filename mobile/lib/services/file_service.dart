import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart'; // For kIsWeb
import '../config/constants.dart'; // Your API constants
import '../models/media_file.dart';

class FileService {
  final Dio _dio;

  FileService({String? token})
      : _dio = Dio(BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 10),
        )) {
    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }


  Future<MediaFile> uploadFile(XFile file) async {
    try {
      String fileName = file.name;
      MultipartFile multipartFile;

      if (kIsWeb) {
        final bytes = await file.readAsBytes();
        multipartFile = MultipartFile.fromBytes(bytes, filename: fileName);
      } else {
        multipartFile = await MultipartFile.fromFile(file.path, filename: fileName);
      }

      FormData formData = FormData.fromMap({
        'file': multipartFile,
      });

      final response = await _dio.post(ApiConstants.fileUploadEndpoint, data: formData);
      final data = response.data is Map ? response.data as Map<String, dynamic> : null;
      if (data == null) {
        throw Exception('Invalid upload response');
      }
      return MediaFile.fromJson(data);
    } on DioException catch (e) {
      throw Exception('Upload failed: ${e.message}');
    }
  }
}