package com.lms.backend.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.lms.backend.entity.Certificate;
import com.lms.backend.repository.CertificateRepository;
import com.lms.backend.service.PdfCertificateService;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfCertificateServiceImpl implements PdfCertificateService {

    private final CertificateRepository certificateRepository;

    public PdfCertificateServiceImpl(CertificateRepository certificateRepository) {
        this.certificateRepository = certificateRepository;
    }

    @Override
    public ByteArrayInputStream generateCertificatePdf(Long certificateId) {
        Certificate cert = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found"));

        Document document = new Document(PageSize.A4.rotate()); // Landscape layout
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Set metadata
            document.addTitle("Certificate of Completion");
            document.addSubject("LearnSphere LMS");
            document.addAuthor("LearnSphere Team");

            // Adding structural space
            Paragraph borderSpacer = new Paragraph();
            borderSpacer.setSpacingBefore(30);
            document.add(borderSpacer);

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 36, Font.BOLD, java.awt.Color.DARK_GRAY);
            Paragraph title = new Paragraph("CERTIFICATE OF COMPLETION", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(25);
            document.add(title);

            // Subtitle
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 16, Font.NORMAL, java.awt.Color.GRAY);
            Paragraph text1 = new Paragraph("This is proudly presented to", textFont);
            text1.setAlignment(Element.ALIGN_CENTER);
            text1.setSpacingAfter(15);
            document.add(text1);

            // Student Name
            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, Font.BOLD, new java.awt.Color(66, 66, 66));
            Paragraph name = new Paragraph(cert.getStudent().getUsername().toUpperCase(), nameFont);
            name.setAlignment(Element.ALIGN_CENTER);
            name.setSpacingAfter(15);
            document.add(name);

            // Completion details
            Paragraph text2 = new Paragraph("for successfully completing the course", textFont);
            text2.setAlignment(Element.ALIGN_CENTER);
            text2.setSpacingAfter(15);
            document.add(text2);

            // Course Title
            Font courseFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD, new java.awt.Color(104, 104, 104));
            Paragraph course = new Paragraph("\"" + cert.getCourse().getTitle() + "\"", courseFont);
            course.setAlignment(Element.ALIGN_CENTER);
            course.setSpacingAfter(35);
            document.add(course);

            // Verification Code
            Font codeFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Font.NORMAL, java.awt.Color.GRAY);
            Paragraph codeText = new Paragraph("Verification Code: " + cert.getCertificateCode(), codeFont);
            codeText.setAlignment(Element.ALIGN_CENTER);
            document.add(codeText);

            document.close();

        } catch (DocumentException ex) {
            throw new RuntimeException("Error occurred while generating PDF", ex);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
