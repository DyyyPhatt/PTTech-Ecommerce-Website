package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.StatisticsDTO;
import com.hcmute.pttechecommercewebsite.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@Tag(name = "Statistics Controller", description = "API quản lý thống kê")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Operation(summary = "Lấy tất cả thống kê",
            description = "Trả về danh sách các thống kê, có thể sắp xếp và lọc theo khoảng thời gian")
    @GetMapping
    public List<StatisticsDTO> getAllStatistics(
            @RequestParam(name = "sortBy", defaultValue = "latest") String sortBy,
            @RequestParam(name = "period", required = false) String period) {

        return statisticsService.getAllStatistics(sortBy, period);
    }

    @Operation(summary = "Lấy chi tiết thống kê theo ID",
            description = "Trả về thông tin chi tiết của thống kê theo ID")
    @GetMapping("/{id}")
    public StatisticsDTO getStatisticsById(@PathVariable String id) {
        return statisticsService.getStatisticsById(id);
    }

    @Operation(summary = "Xuất thống kê ra file Excel",
            description = "Xuất các dữ liệu thống kê thành file Excel để tải về")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportStatisticsToExcel(
            @RequestParam(name = "sortBy", defaultValue = "latest") String sortBy,
            @RequestParam(name = "period", required = false) String period) {

        try {
            ByteArrayOutputStream outputStream = statisticsService.exportStatisticsToExcel(sortBy, period);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=statistics.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}
