package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.UserDTO;
import com.hcmute.pttechecommercewebsite.exception.MessageResponse;
import com.hcmute.pttechecommercewebsite.model.User;
import com.hcmute.pttechecommercewebsite.service.EmailTemplateService;
import com.hcmute.pttechecommercewebsite.service.UserService;
import com.hcmute.pttechecommercewebsite.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Controller", description = "API quản lý người dùng")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private EmailTemplateService emailTemplateService;

    @Autowired
    private JwtUtil jwtUtil;

    @Operation(summary = "Lấy tất cả người dùng")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Lấy người dùng theo ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Người dùng được tìm thấy"),
                    @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng",
                            content = @Content)
            })
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        Optional<UserDTO> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Tìm kiếm người dùng theo tên (username)")
    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsersByUsername(@RequestParam String username) {
        List<UserDTO> users = userService.searchUsersByUsername(username);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Thêm mới người dùng")
    @PostMapping
    public ResponseEntity<UserDTO> addUser(@RequestBody User user) {
        UserDTO newUser = userService.addUser(user);
        return ResponseEntity.ok(newUser);
    }

    @Operation(summary = "Cập nhật thông tin người dùng theo ID")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @RequestBody User user) {
        UserDTO updatedUser = userService.updateUser(id, user);
        return updatedUser != null ? ResponseEntity.ok(updatedUser) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Xóa người dùng theo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        boolean isDeleted = userService.deleteUser(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Block người dùng theo ID")
    @PutMapping("/block/{id}")
    public ResponseEntity<String> blockUser(@PathVariable String id, @RequestParam String blockReason) {
        boolean success = userService.blockUser(id, blockReason);
        if (success) {
            return ResponseEntity.ok("Block User thành công!");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy user.");
    }

    @Operation(summary = "Gỡ block người dùng theo ID")
    @PutMapping("/unblock/{id}")
    public ResponseEntity<String> unblockUser(@PathVariable String id) {
        boolean success = userService.unblockUser(id);
        if (success) {
            return ResponseEntity.ok("Gỡ block User thành công!");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy user.");
    }

    @Operation(summary = "Đăng ký người dùng mới")
    @PostMapping("/register")
    public UserDTO registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @Operation(summary = "Xác thực tài khoản người dùng qua token")
    @GetMapping("/verify")
    public ResponseEntity<String> verifyUser(@RequestParam("token") String token) {
        boolean isVerified = userService.verifyUser(token);

        if (isVerified) {
            return ResponseEntity.ok(emailTemplateService.getVerificationSuccessPage());
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(emailTemplateService.getVerificationFailurePage());
        }
    }

    @Operation(summary = "Gửi email để reset mật khẩu")
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email, @RequestParam boolean isAdmin, @RequestParam boolean isMobile) {
        try {
            String message = userService.sendPasswordResetEmail(email, isAdmin, isMobile);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Operation(summary = "Reset mật khẩu")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        boolean isReset = userService.resetPassword(token, newPassword);
        if (isReset) {
            return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công.");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token không hợp lệ hoặc đã hết hạn.");
    }

    @Operation(summary = "Gửi email thông báo đến người dùng")
    @PostMapping("/send-notification")
    public ResponseEntity<String> sendNotificationEmail(@RequestBody Map<String, Object> request) {

        try {
            String subject = (String) request.get("subject");
            String content = (String) request.get("content");
            List<String> userIds = (List<String>) request.get("userIds");

            String response = userService.sendNotificationEmail(subject, content, userIds);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    @Operation(summary = "Đăng nhập người dùng bằng email và mật khẩu")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        try {
            return userService.loginUser(email, password);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã có lỗi xảy ra trong quá trình đăng nhập.");
        }
    }

    @Operation(summary = "Đăng nhập bằng Google OAuth2")
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String tokenId = request.get("tokenId");
        return userService.googleLogin(tokenId);
    }

    @Operation(summary = "Đăng nhập bằng Facebook OAuth2")
    @PostMapping("/facebook-login")
    public ResponseEntity<?> facebookLogin(@RequestParam String accessToken) {
        return userService.facebookLogin(accessToken);
    }

    @Operation(summary = "Đăng ký nhận thông báo qua email")
    @PostMapping("/subscribe")
    public ResponseEntity<String> subscribeToEmail(@RequestParam String email) {
        try {
            return userService.subscribeToEmailNotifications(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã có lỗi xảy ra khi đăng ký nhận thông báo.");
        }
    }

    @Operation(summary = "Cấp mới access token bằng refresh token")
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestParam String refreshToken) {
        try {
            String username = jwtUtil.extractUsername(refreshToken);

            if (username != null && jwtUtil.isTokenValid(refreshToken)) {
                List<String> roles = jwtUtil.extractRoles(refreshToken);
                String newAccessToken = jwtUtil.generateToken("userId", username, roles);
                return ResponseEntity.ok(newAccessToken);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Refresh token không hợp lệ.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Có lỗi xảy ra khi làm mới token.");
        }
    }

    @Operation(summary = "Tải ảnh avatar lên cho người dùng")
    @PostMapping("/upload-avatar/{userId}")
    public ResponseEntity<MessageResponse> uploadAvatar(@RequestParam("file") MultipartFile file, @PathVariable String userId) {
        try {
            String avatarUrl = userService.uploadAvatar(file, userId);
            return ResponseEntity.ok(new MessageResponse("Tải ảnh avatar lên thành công", avatarUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi tải ảnh avatar lên", e.getMessage()));
        }
    }

    @Operation(summary = "Xóa avatar người dùng theo ID")
    @DeleteMapping("/delete-avatar/{userId}")
    public ResponseEntity<Object> deleteUserAvatar(@PathVariable String userId) {
        try {
            userService.deleteUserAvatar(userId);
            return new ResponseEntity<>(new MessageResponse("Xóa avatar người dùng thành công!", userId), HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi xóa avatar người dùng", e.getMessage()));
        }
    }

    @Operation(summary = "Xuất danh sách người dùng ra file Excel")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportUsersToExcel(@RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
                                                     @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        try {
            ByteArrayOutputStream outputStream = userService.exportUsersToExcel(sortBy, sortOrder);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}