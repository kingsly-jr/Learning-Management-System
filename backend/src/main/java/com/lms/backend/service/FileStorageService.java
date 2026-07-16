package com.lms.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    void init();
    String storeFile(MultipartFile file);
}
