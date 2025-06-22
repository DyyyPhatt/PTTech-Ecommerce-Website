package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.QADTO;
import com.hcmute.pttechecommercewebsite.model.QA;
import com.hcmute.pttechecommercewebsite.service.QAService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/qas")
@Tag(name = "QA Controller", description = "API quản lý Q&A (Questions and Answers)")
public class QAController {

    @Autowired
    private QAService qaService;

    @Operation(summary = "Lấy tất cả Q&A, sắp xếp theo thứ tự mới nhất hoặc cũ nhất")
    @GetMapping("")
    public ResponseEntity<List<QADTO>> getAllQAs(@RequestParam(defaultValue = "desc") String sortOrder) {
        List<QADTO> qaList = qaService.getAllQAsSorted(sortOrder);
        return new ResponseEntity<>(qaList, HttpStatus.OK);
    }

    @Operation(summary = "Lấy Q&A theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<QADTO> getQAById(@PathVariable String id) {
        QADTO qa = qaService.getQAById(id);
        return new ResponseEntity<>(qa, HttpStatus.OK);
    }

    @Operation(summary = "Lấy danh sách Q&A theo userId")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QADTO>> getQAsByUserId(@PathVariable String userId) {
        List<QADTO> qaList = qaService.getQAsByUserId(userId);
        return new ResponseEntity<>(qaList, HttpStatus.OK);
    }

    @Operation(summary = "Lấy danh sách Q&A theo productId")
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<QADTO>> getQAsByProductId(@PathVariable String productId) {
        List<QADTO> qaList = qaService.getQAsByProductId(productId);
        return new ResponseEntity<>(qaList, HttpStatus.OK);
    }

    @Operation(summary = "Tạo mới Q&A")
    @PostMapping("")
    public ResponseEntity<QADTO> createQA(@RequestBody QA qa) {
        QADTO newQA = qaService.createQA(qa);
        return new ResponseEntity<>(newQA, HttpStatus.CREATED);
    }

    @Operation(summary = "Cập nhật Q&A theo ID")
    @PutMapping("/{id}")
    public ResponseEntity<QADTO> updateQA(@PathVariable String id, @RequestBody QA qa) {
        qa.setId(id);
        QADTO updatedQA = qaService.updateQA(qa);
        return new ResponseEntity<>(updatedQA, HttpStatus.OK);
    }

    @Operation(summary = "Xóa Q&A theo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQA(@PathVariable String id) {
        qaService.deleteQA(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(summary = "Trả lời Q&A")
    @PostMapping("/{qaId}/answer")
    public ResponseEntity<QADTO> answerQA(@PathVariable String qaId,
                                          @RequestParam String answer,
                                          @RequestParam String adminId) {
        QADTO updatedQA = qaService.answerQA(qaId, answer, adminId);
        return new ResponseEntity<>(updatedQA, HttpStatus.OK);
    }

    @Operation(summary = "Cập nhật câu trả lời Q&A")
    @PutMapping("/{qaId}/answer/{questionId}")
    public ResponseEntity<QADTO> updateAnswer(@PathVariable String qaId,
                                              @PathVariable String questionId,
                                              @RequestParam String newAnswer) {
        QADTO updatedQA = qaService.updateAnswer(qaId, questionId, newAnswer);
        return new ResponseEntity<>(updatedQA, HttpStatus.OK);
    }

    @Operation(summary = "Xóa câu trả lời Q&A")
    @DeleteMapping("/{qaId}/answer/{questionId}")
    public ResponseEntity<QADTO> deleteAnswer(@PathVariable String qaId,
                                              @PathVariable String questionId) {
        QADTO updatedQA = qaService.deleteAnswer(qaId, questionId);
        return new ResponseEntity<>(updatedQA, HttpStatus.NO_CONTENT);
    }

    @Operation(summary = "Thêm câu hỏi phụ (follow-up question)")
    @PostMapping("/{qaId}/question/{parentQuestionId}/follow-up")
    public ResponseEntity<QADTO> addFollowUpQuestion(@PathVariable String qaId,
                                                     @PathVariable String parentQuestionId,
                                                     @RequestParam String newQuestion) {
        QADTO updatedQA = qaService.addFollowUpQuestion(qaId, parentQuestionId, newQuestion);
        return new ResponseEntity<>(updatedQA, HttpStatus.CREATED);
    }

    @Operation(summary = "Trả lời câu hỏi phụ")
    @PostMapping("/{qaId}/follow-up/{followUpQuestionId}/answer")
    public ResponseEntity<QADTO> answerFollowUpQuestion(@PathVariable String qaId,
                                                        @PathVariable String followUpQuestionId,
                                                        @RequestParam String answer,
                                                        @RequestParam String adminId) {
        QADTO updatedQA = qaService.answerFollowUpQuestion(qaId, followUpQuestionId, answer, adminId);
        return new ResponseEntity<>(updatedQA, HttpStatus.OK);
    }

    @Operation(summary = "Xóa câu hỏi phụ")
    @DeleteMapping("/{qaId}/follow-up/{followUpQuestionId}")
    public ResponseEntity<QADTO> deleteFollowUpQuestion(@PathVariable String qaId,
                                                        @PathVariable String followUpQuestionId) {
        QADTO updatedQA = qaService.deleteFollowUpQuestion(qaId, followUpQuestionId);
        return new ResponseEntity<>(updatedQA, HttpStatus.NO_CONTENT);
    }

    @Operation(summary = "Cập nhật câu trả lời câu hỏi phụ")
    @PutMapping("/{qaId}/follow-up/{followUpQuestionId}/answer")
    public ResponseEntity<QADTO> updateFollowUpAnswer(@PathVariable String qaId,
                                                      @PathVariable String followUpQuestionId,
                                                      @RequestParam String newAnswer) {
        QADTO updatedQA = qaService.updateFollowUpAnswer(qaId, followUpQuestionId, newAnswer);
        return new ResponseEntity<>(updatedQA, HttpStatus.OK);
    }

    @Operation(summary = "Xóa câu trả lời câu hỏi phụ")
    @DeleteMapping("/{qaId}/follow-up/{followUpQuestionId}/answer")
    public ResponseEntity<QADTO> deleteFollowUpAnswer(@PathVariable String qaId,
                                                      @PathVariable String followUpQuestionId) {
        QADTO updatedQA = qaService.deleteFollowUpAnswer(qaId, followUpQuestionId);
        return new ResponseEntity<>(updatedQA, HttpStatus.NO_CONTENT);
    }
}
