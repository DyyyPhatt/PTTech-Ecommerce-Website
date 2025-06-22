package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.PolicyDTO;
import com.hcmute.pttechecommercewebsite.exception.MessageResponse;
import com.hcmute.pttechecommercewebsite.exception.ResourceNotFoundException;
import com.hcmute.pttechecommercewebsite.service.PolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/policies")
@Tag(name = "Policy Controller", description = "API quản lý chính sách")
public class PolicyController {

    private final PolicyService policyService;

    @Autowired
    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @Operation(summary = "Lấy danh sách tất cả chính sách", description = "Trả về danh sách các chính sách theo thứ tự sắp xếp")
    @GetMapping
    public ResponseEntity<List<PolicyDTO>> getAllPolicies(
            @RequestParam(value = "sortBy", defaultValue = "title") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder) {

        List<PolicyDTO> policies = policyService.getAllPolicies(sortBy, sortOrder);
        if (policies.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(policies, HttpStatus.OK);
    }

    @Operation(summary = "Lấy danh sách chính sách chưa bị xóa (deleted=false)", description = "Trả về danh sách các chính sách chưa bị soft delete")
    @GetMapping("/no-delete")
    public ResponseEntity<List<PolicyDTO>> getAllPoliciesWithDeletedFalse(
            @RequestParam(value = "sortBy", defaultValue = "title") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder) {

        List<PolicyDTO> policies = policyService.getAllPoliciesWithDeletedFalse(sortBy, sortOrder);
        if (policies.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(policies, HttpStatus.OK);
    }

    @Operation(summary = "Lấy chi tiết chính sách theo ID", description = "Trả về thông tin chi tiết của một chính sách theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<PolicyDTO> getPolicyById(@PathVariable String id) {
        return policyService.getPolicyById(id)
                .map(policyDTO -> new ResponseEntity<>(policyDTO, HttpStatus.OK))
                .orElseThrow(() -> new ResourceNotFoundException("Chính sách với ID " + id + " không tồn tại"));
    }

    @Operation(summary = "Tìm kiếm chính sách theo tiêu đề", description = "Tìm kiếm chính sách có tiêu đề chứa từ khóa")
    @GetMapping("/search")
    public ResponseEntity<List<PolicyDTO>> searchPolicies(@RequestParam String keyword) {
        List<PolicyDTO> policies = policyService.searchPoliciesByTitle(keyword);
        if (policies.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(policies);
    }

    @Operation(summary = "Tạo mới một chính sách", description = "Thêm mới chính sách từ dữ liệu đầu vào")
    @PostMapping
    public ResponseEntity<PolicyDTO> createPolicy(@ModelAttribute PolicyDTO policyDTO) {
        PolicyDTO createdPolicy = policyService.createPolicy(policyDTO);
        return new ResponseEntity<>(createdPolicy, HttpStatus.CREATED);
    }

    @Operation(summary = "Tạo mới chính sách có lên lịch", description = "Tạo chính sách với thời gian lên lịch")
    @PostMapping("/schedule-create")
    public ResponseEntity<PolicyDTO> scheduleCreatePolicy(@RequestBody PolicyDTO policyDTO) {
        PolicyDTO scheduledPolicy = policyService.scheduleCreatePolicy(policyDTO);
        return new ResponseEntity<>(scheduledPolicy, HttpStatus.CREATED);
    }

    @Operation(summary = "Cập nhật chính sách theo ID", description = "Chỉnh sửa thông tin chính sách theo ID")
    @PutMapping("/{id}")
    public ResponseEntity<Object> updatePolicy(@PathVariable String id, @ModelAttribute PolicyDTO policyDTO) {
        PolicyDTO updatedPolicy = policyService.updatePolicy(id, policyDTO);
        return new ResponseEntity<>(new MessageResponse("Chỉnh sửa chính sách thành công!", updatedPolicy), HttpStatus.OK);
    }

    @Operation(summary = "Ẩn chính sách theo ID", description = "Ẩn chính sách để không hiển thị")
    @PutMapping("/hide/{id}")
    public ResponseEntity<Object> hidePolicy(@PathVariable String id) {
        PolicyDTO hiddenPolicy = policyService.hidePolicy(id);
        return new ResponseEntity<>(new MessageResponse("Ẩn chính sách thành công!", hiddenPolicy), HttpStatus.OK);
    }

    @Operation(summary = "Hiện chính sách theo ID", description = "Hiện chính sách đã ẩn để hiển thị lại")
    @PutMapping("/show/{id}")
    public ResponseEntity<Object> showPolicy(@PathVariable String id) {
        PolicyDTO shownPolicy = policyService.showPolicy(id);
        return new ResponseEntity<>(new MessageResponse("Hiện chính sách thành công!", shownPolicy), HttpStatus.OK);
    }

    @Operation(summary = "Xóa chính sách theo ID (soft delete)", description = "Xóa chính sách bằng cách đánh dấu soft delete")
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletePolicy(@PathVariable String id) {
        policyService.deletePolicy(id);
        return new ResponseEntity<>(new MessageResponse("Bạn đã thực hiện xóa thành công chính sách với ID: " + id, id), HttpStatus.OK);
    }

    @Operation(summary = "Xuất danh sách chính sách ra file Excel", description = "Tải xuống file Excel chứa danh sách chính sách theo tiêu chí lọc và sắp xếp")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportPoliciesToExcel(
            @RequestParam(value = "sortBy", defaultValue = "title") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        try {
            ByteArrayOutputStream outputStream = policyService.exportPoliciesToExcel(sortBy, sortOrder);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=policies.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}