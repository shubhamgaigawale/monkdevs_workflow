package com.crm.hrservice.service;

import com.crm.hrservice.entity.SalarySlip;
import com.crm.hrservice.entity.SalarySlipComponent;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for generating salary slip PDFs
 */
@Service
@Slf4j
public class SalarySlipPdfService {

    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(41, 128, 185);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(240, 240, 240);

    /**
     * Generate salary slip PDF
     */
    public byte[] generateSalarySlipPdf(SalarySlip salarySlip) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Add title
            Paragraph title = new Paragraph("SALARY SLIP")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            // Add company name
            Paragraph companyName = new Paragraph("Your Company Name")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(companyName);

            // Add period
            String monthYear = getMonthYear(salarySlip.getMonth(), salarySlip.getYear());
            Paragraph period = new Paragraph("For the month of " + monthYear)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(period);

            // Add basic info table
            addBasicInfoTable(document, salarySlip);

            // Add separator
            document.add(new Paragraph("\n"));

            // Add earnings and deductions table
            addEarningsDeductionsTable(document, salarySlip);

            // Add separator
            document.add(new Paragraph("\n"));

            // Add summary table
            addSummaryTable(document, salarySlip);

            // Add footer
            addFooter(document, salarySlip);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating salary slip PDF", e);
            throw new RuntimeException("Failed to generate salary slip PDF", e);
        }
    }

    private void addBasicInfoTable(Document document, SalarySlip salarySlip) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(10);

        table.addCell(createCell("Employee ID:", false));
        table.addCell(createCell(salarySlip.getUserId().toString().substring(0, 8) + "...", false));

        table.addCell(createCell("Pay Period:", false));
        table.addCell(createCell(getMonthYear(salarySlip.getMonth(), salarySlip.getYear()), false));

        table.addCell(createCell("Paid Days:", false));
        table.addCell(createCell(formatDecimal(salarySlip.getPaidDays()), false));

        table.addCell(createCell("LOP Days:", false));
        table.addCell(createCell(formatDecimal(salarySlip.getLopDays()), false));

        if (salarySlip.getGeneratedDate() != null) {
            table.addCell(createCell("Generated Date:", false));
            table.addCell(createCell(
                    salarySlip.getGeneratedDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")),
                    false
            ));
        }

        if (salarySlip.getPaidDate() != null) {
            table.addCell(createCell("Paid Date:", false));
            table.addCell(createCell(
                    salarySlip.getPaidDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")),
                    false
            ));
        }

        document.add(table);
    }

    private void addEarningsDeductionsTable(Document document, SalarySlip salarySlip) {
        // Separate earnings and deductions
        List<SalarySlipComponent> earnings = salarySlip.getComponents().stream()
                .filter(c -> "EARNING".equals(c.getComponentType()))
                .collect(Collectors.toList());

        List<SalarySlipComponent> deductions = salarySlip.getComponents().stream()
                .filter(c -> "DEDUCTION".equals(c.getComponentType()))
                .collect(Collectors.toList());

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 1, 2, 1}))
                .useAllAvailableWidth();

        // Header row
        table.addHeaderCell(createHeaderCell("Earnings"));
        table.addHeaderCell(createHeaderCell("Amount (₹)"));
        table.addHeaderCell(createHeaderCell("Deductions"));
        table.addHeaderCell(createHeaderCell("Amount (₹)"));

        // Add rows
        int maxRows = Math.max(earnings.size(), deductions.size());
        BigDecimal totalEarnings = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;

        for (int i = 0; i < maxRows; i++) {
            // Earnings column
            if (i < earnings.size()) {
                SalarySlipComponent earning = earnings.get(i);
                table.addCell(createCell(earning.getComponentName(), false));
                table.addCell(createCell(formatCurrency(earning.getAmount()), false, TextAlignment.RIGHT));
                totalEarnings = totalEarnings.add(earning.getAmount());
            } else {
                table.addCell(createCell("", false));
                table.addCell(createCell("", false));
            }

            // Deductions column
            if (i < deductions.size()) {
                SalarySlipComponent deduction = deductions.get(i);
                table.addCell(createCell(deduction.getComponentName(), false));
                table.addCell(createCell(formatCurrency(deduction.getAmount()), false, TextAlignment.RIGHT));
                totalDeductions = totalDeductions.add(deduction.getAmount());
            } else {
                table.addCell(createCell("", false));
                table.addCell(createCell("", false));
            }
        }

        // Total row
        table.addCell(createCell("Total Earnings", true));
        table.addCell(createCell(formatCurrency(totalEarnings), true, TextAlignment.RIGHT));
        table.addCell(createCell("Total Deductions", true));
        table.addCell(createCell(formatCurrency(totalDeductions), true, TextAlignment.RIGHT));

        document.add(table);
    }

    private void addSummaryTable(Document document, SalarySlip salarySlip) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .useAllAvailableWidth();

        table.addCell(createCell("Gross Salary", true));
        table.addCell(createCell(formatCurrency(salarySlip.getGrossSalary()), true, TextAlignment.RIGHT));

        table.addCell(createCell("Total Deductions", true));
        table.addCell(createCell(formatCurrency(salarySlip.getTotalDeductions()), true, TextAlignment.RIGHT));

        // Net salary with background color
        Cell netLabelCell = createCell("Net Salary", true);
        netLabelCell.setBackgroundColor(LIGHT_GRAY);
        table.addCell(netLabelCell);

        Cell netAmountCell = createCell(formatCurrency(salarySlip.getNetSalary()), true, TextAlignment.RIGHT);
        netAmountCell.setBackgroundColor(LIGHT_GRAY);
        table.addCell(netAmountCell);

        document.add(table);
    }

    private void addFooter(Document document, SalarySlip salarySlip) {
        document.add(new Paragraph("\n"));

        Paragraph note = new Paragraph("Note: This is a system generated salary slip and does not require signature.")
                .setFontSize(9)
                .setItalic()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(note);

        Paragraph disclaimer = new Paragraph("Status: " + salarySlip.getStatus())
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(5);
        document.add(disclaimer);
    }

    private Cell createHeaderCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold())
                .setBackgroundColor(HEADER_COLOR)
                .setFontColor(ColorConstants.WHITE)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(5);
    }

    private Cell createCell(String text, boolean bold) {
        return createCell(text, bold, TextAlignment.LEFT);
    }

    private Cell createCell(String text, boolean bold, TextAlignment alignment) {
        Paragraph p = new Paragraph(text);
        if (bold) {
            p.setBold();
        }
        return new Cell()
                .add(p)
                .setTextAlignment(alignment)
                .setPadding(5);
    }

    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.2f", amount);
    }

    private String formatDecimal(BigDecimal value) {
        if (value == null) {
            return "0";
        }
        return value.stripTrailingZeros().toPlainString();
    }

    private String getMonthYear(Integer month, Integer year) {
        String[] months = {"", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};
        return months[month] + " " + year;
    }
}
