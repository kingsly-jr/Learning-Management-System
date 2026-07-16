package com.lms.backend.service;

import java.io.ByteArrayInputStream;

public interface PdfCertificateService {
    ByteArrayInputStream generateCertificatePdf(Long certificateId);
}
