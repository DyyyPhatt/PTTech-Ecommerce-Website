package com.hcmute.pttechecommercewebsite.service;

import com.hcmute.pttechecommercewebsite.model.Order;
import com.hcmute.pttechecommercewebsite.model.Review;
import com.hcmute.pttechecommercewebsite.model.User;
import com.hcmute.pttechecommercewebsite.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Optional;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    // Gửi email xác thực
    public void sendVerificationEmail(User user) {
        String subject = "Xác Thực Tài Khoản - PTTech";

        // Đường dẫn xác thực
        String verificationUrl = "http://localhost:8081/api/users/verify?token=" + user.getVerificationToken();

        // Thời gian hết hạn token (nếu có trong model User)
        String expiredAt = new SimpleDateFormat("dd/MM/yyyy HH:mm").format(user.getVerificationExpiry());

        // Nội dung email HTML
        String emailContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }" +
                ".container { max-width: 600px; margin: 30px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }" +
                ".header { text-align: center; margin-bottom: 20px; }" +
                ".header img { max-height: 60px; margin-bottom: 10px; }" +
                ".header h1 { color: #0056b3; font-size: 22px; margin: 0; }" +
                ".content { font-size: 16px; line-height: 1.6; }" +
                ".cta { display: block; width: fit-content; margin: 30px auto; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; font-weight: bold; text-align: center; border-radius: 4px; transition: background-color 0.3s ease; }" +
                ".cta:hover { background-color: #0056b3; }" +
                ".qr-code { text-align: center; margin-top: 20px; }" +
                ".footer { text-align: center; font-size: 14px; color: #777; margin-top: 40px; }" +
                ".footer a { color: #0056b3; text-decoration: none; }" +
                "@media only screen and (max-width: 600px) {" +
                "  .container { padding: 10px; }" +
                "  .cta { width: 100%; box-sizing: border-box; }" +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Xác Thực Tài Khoản</h1>" +
                "<p>Chào <strong>" + user.getUsername() + "</strong>,</p>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>PTTech</strong>. Để bảo vệ tài khoản và xác nhận email, vui lòng nhấp vào nút bên dưới để hoàn tất xác thực:</p>" +
                "<a href='" + verificationUrl + "' class='cta'>Xác thực tài khoản của bạn</a>" +
                "<p>Liên kết xác thực sẽ hết hạn vào: <strong>" + expiredAt + "</strong></p>" +
                "<div class='qr-code'>" +
                "<p>Hoặc quét mã QR để xác thực:</p>" +
                "<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + verificationUrl + "' alt='QR Code'>" +
                "</div>" +
                "<p style='color: #d9534f;'>Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Trân trọng,</p>" +
                "<p><strong>Phòng Hỗ Trợ Khách Hàng - PTTech</strong><br>" +
                "📍 01 Đường Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh<br>" +
                "🌐 <a href='http://localhost:8080'>www.pttech.com</a><br>" +
                "📧 <a href='mailto:support@pttech.com'>support@pttech.com</a><br>" +
                "☎ Hotline: 1800 1234 (Miễn phí)</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(emailContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public void sendPasswordResetEmail(User user, boolean isAdmin, boolean isMobile) {
        String subject = "Yêu cầu thay đổi mật khẩu - PTTech";
        String resetUrl;

        // Tạo URL reset phù hợp theo vai trò và nền tảng
        if (isAdmin) {
            resetUrl = isMobile
                    ? "http://10.0.2.2:8088/reset-password/" + user.getVerificationToken()
                    : "http://localhost:8088/reset-password/" + user.getVerificationToken();
        } else {
            resetUrl = isMobile
                    ? "http://10.0.2.2:8080/reset-password/" + user.getVerificationToken()
                    : "http://localhost:8080/reset-password/" + user.getVerificationToken();
        }

        // Thời gian hết hạn liên kết (nếu bạn có dữ liệu)
        String expiredAt = new SimpleDateFormat("dd/MM/yyyy HH:mm").format(user.getVerificationExpiry());

        String emailContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }" +
                ".container { max-width: 600px; margin: 30px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }" +
                ".header { text-align: center; margin-bottom: 20px; }" +
                ".header img { max-height: 60px; margin-bottom: 10px; }" +
                ".header h1 { color: #c0392b; font-size: 22px; margin: 0; }" +
                ".content { font-size: 16px; line-height: 1.6; }" +
                ".cta { display: block; width: fit-content; margin: 30px auto; padding: 12px 24px; background-color: #e74c3c; color: #fff; text-decoration: none; font-weight: bold; text-align: center; border-radius: 4px; transition: background-color 0.3s ease; }" +
                ".cta:hover { background-color: #c0392b; }" +
                ".qr-code { text-align: center; margin-top: 20px; }" +
                ".footer { text-align: center; font-size: 14px; color: #777; margin-top: 40px; }" +
                ".footer a { color: #c0392b; text-decoration: none; }" +
                "@media only screen and (max-width: 600px) {" +
                "  .container { padding: 10px; }" +
                "  .cta { width: 100%; box-sizing: border-box; }" +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Thay đổi mật khẩu</h1>" +
                "<p>Chào <strong>" + user.getUsername() + "</strong>,</p>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Chúng tôi đã nhận được yêu cầu thay đổi mật khẩu từ bạn. Để tiếp tục, vui lòng nhấn vào nút bên dưới:</p>" +
                "<a href='" + resetUrl + "' class='cta'>Thay đổi mật khẩu của bạn</a>" +
                "<p>Liên kết này sẽ hết hạn vào: <strong>" + expiredAt + "</strong></p>" +
                "<div class='qr-code'>" +
                "<p>Hoặc quét mã QR sau:</p>" +
                "<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + resetUrl + "' alt='QR Code'>" +
                "</div>" +
                "<p style='color: #d9534f;'>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Trân trọng,</p>" +
                "<p><strong>Phòng Hỗ Trợ Khách Hàng - PTTech</strong><br>" +
                "📍 01 Đường Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh<br>" +
                "🌐 <a href='http://localhost:8080'>www.pttech.com</a><br>" +
                "📧 <a href='mailto:support@pttech.com'>support@pttech.com</a><br>" +
                "☎ Hotline: 1800 1234 (Miễn phí)</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(emailContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public void sendNotificationEmail(String subject, String content, String userEmail) {
        String emailContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }" +
                ".container { max-width: 600px; margin: 30px auto; background: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }" +
                ".header { text-align: center; margin-bottom: 20px; }" +
                ".header img { max-height: 60px; margin-bottom: 10px; }" +
                ".header h1 { color: #0056b3; font-size: 22px; margin: 0; }" +
                ".content { font-size: 16px; line-height: 1.6; color: #333; margin-top: 10px; }" +
                ".content p { margin: 12px 0; }" +
                ".footer { text-align: center; font-size: 14px; color: #777; margin-top: 40px; }" +
                ".footer a { color: #0056b3; text-decoration: none; }" +
                "@media only screen and (max-width: 600px) {" +
                "  .container { padding: 12px; }" +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Thông Báo Quan Trọng từ PTTech</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<p>" + content + "</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Trân trọng,</p>" +
                "<p><strong>PTTech</strong><br>" +
                "📍 01 Đường Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh<br>" +
                "🌐 <a href='http://localhost:8080'>www.pttech.com</a><br>" +
                "📧 <a href='mailto:support@pttech.com'>support@pttech.com</a><br>" +
                "☎ Hotline: 1800 1234 (Miễn phí)</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(userEmail);
            helper.setSubject(subject);
            helper.setText(emailContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    // Gửi email cảm ơn
    public void sendThankYouEmail(Review review) {
        Optional<User> userOpt = userRepository.findById(review.getUserId().toString());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String userEmail = user.getEmail();
            String userName = user.getUsername();

            String subject = "❤️ Cảm ơn bạn đã đánh giá sản phẩm - PTTech";

            String emailContent = "<!DOCTYPE html>" +
                    "<html lang='vi'>" +
                    "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>" +
                    "body { font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }" +
                    ".container { max-width: 600px; margin: 30px auto; background: #ffffff; padding: 24px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }" +
                    ".header { text-align: center; margin-bottom: 20px; }" +
                    ".header img { max-height: 60px; margin-bottom: 12px; }" +
                    ".header h1 { font-size: 24px; color: #2c3e50; margin: 0; }" +
                    ".content { font-size: 16px; line-height: 1.6; padding-top: 10px; }" +
                    ".content ul { padding-left: 20px; }" +
                    ".content li { margin-bottom: 6px; }" +
                    ".rating { color: #f39c12; font-weight: bold; }" +
                    ".footer { text-align: center; font-size: 14px; color: #777; margin-top: 40px; }" +
                    ".footer a { color: #0056b3; text-decoration: none; }" +
                    "@media (max-width: 600px) { .container { padding: 15px; } }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class='container'>" +
                    "<div class='header'>" +
                    "<h1>🌟 Cảm ơn bạn, " + userName + "!</h1>" +
                    "</div>" +
                    "<div class='content'>" +
                    "<p>Chúng tôi rất biết ơn vì bạn đã dành thời gian chia sẻ đánh giá về sản phẩm của chúng tôi!</p>" +
                    "<p>Phản hồi của bạn không chỉ giúp chúng tôi cải thiện chất lượng sản phẩm mà còn hỗ trợ những khách hàng khác trong việc lựa chọn sản phẩm phù hợp.</p>" +
                    "<p><strong>Chi tiết đánh giá của bạn:</strong></p>" +
                    "<ul>" +
                    "<li><strong>Tiêu đề:</strong> " + review.getReviewTitle() + "</li>" +
                    "<li><strong>Nội dung:</strong> " + review.getReview() + "</li>" +
                    "<li><strong>Đánh giá sao:</strong> <span class='rating'>" + review.getRating() + " ⭐</span></li>" +
                    "</ul>" +
                    "<p>Chúng tôi cam kết tiếp tục cải tiến để mang đến cho bạn trải nghiệm tốt nhất.</p>" +
                    "<p>Trân trọng,</p>" +
                    "<p><strong>Đội ngũ PTTech</strong><br>" +
                    "📍 01 Đường Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh<br>" +
                    "🌐 <a href='http://localhost:8080'>www.pttech.com</a><br>" +
                    "📧 <a href='mailto:support@pttech.com'>support@pttech.com</a><br>" +
                    "☎ Hotline: 1800 1234 (Miễn phí)</p>" +
                    "</div>" +
                    "<div class='footer'>" +
                    "<p>✨ Hãy tiếp tục đồng hành và chia sẻ thêm cảm nhận của bạn với PTTech trong tương lai nhé!</p>" +
                    "</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";

            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(userEmail);
                helper.setSubject(subject);
                helper.setText(emailContent, true);
                mailSender.send(mimeMessage);
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }

    public void sendThankYouEmailForBugReport(String email, String bugType, String description) {
        String subject = "🐞 Cảm ơn bạn đã báo lỗi - PTTech";

        String emailContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }" +
                ".container { max-width: 600px; margin: 30px auto; background: #ffffff; padding: 24px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }" +
                ".header { text-align: center; margin-bottom: 20px; }" +
                ".header h1 { font-size: 24px; color: #2c3e50; margin: 0; }" +
                ".content { font-size: 16px; line-height: 1.6; padding-top: 10px; }" +
                ".bug-details { " +
                "border: 1.5px solid #e74c3c; " +
                "background-color: #fdecea; " +
                "border-radius: 8px; " +
                "padding: 16px 20px; " +
                "margin-top: 12px; " +
                "color: #c0392b; " +
                "font-weight: 600; " +
                "box-shadow: inset 0 0 8px rgba(231, 76, 60, 0.1);" +
                "}" +
                ".bug-details li { margin-bottom: 8px; font-weight: 500; }" +
                ".footer { text-align: center; font-size: 14px; color: #777; margin-top: 40px; }" +
                ".footer a { color: #0056b3; text-decoration: none; }" +
                "@media (max-width: 600px) { .container { padding: 15px; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>💌 Cảm ơn bạn đã báo lỗi!</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Chúng tôi rất trân trọng việc bạn đã dành thời gian để thông báo cho chúng tôi về lỗi trong hệ thống.</p>" +
                "<p>Thông tin bạn cung cấp sẽ giúp chúng tôi nhanh chóng cải thiện chất lượng dịch vụ và trải nghiệm của người dùng.</p>" +
                "<p><strong>Chi tiết báo lỗi:</strong></p>" +
                "<ul class='bug-details'>" +
                "<li><strong>Loại lỗi:</strong> " + bugType + "</li>" +
                "<li><strong>Mô tả:</strong><br> " + description.replace("\n", "<br>") + "</li>" +
                "</ul>" +
                "<p>Chúng tôi sẽ kiểm tra và xử lý lỗi sớm nhất có thể.</p>" +
                "<p>Trân trọng,</p>" +
                "<p><strong>Đội ngũ PTTech</strong><br>" +
                "📍 01 Đường Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh<br>" +
                "🌐 <a href='http://localhost:8080'>www.pttech.com</a><br>" +
                "📧 <a href='mailto:support@pttech.com'>support@pttech.com</a><br>" +
                "☎ Hotline: 1800 1234 (Miễn phí)</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>✨ Đừng ngần ngại tiếp tục phản hồi để giúp PTTech ngày càng hoàn thiện hơn nhé!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(emailContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public void sendThankYouOrderEmail(Order order) {
        Optional<User> userOpt = userRepository.findById(order.getUserId().toString());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String userEmail = user.getEmail();
            String userName = user.getUsername();

            String subject = "🎉 Cảm ơn bạn đã đặt hàng tại PTTech!";

            StringBuilder itemsHtml = new StringBuilder();
            for (Order.Item item : order.getItems()) {
                itemsHtml.append("<tr>")
                        .append("<td style='padding: 12px 8px; border-bottom: 1px solid #eee;'>")
                        .append(item.getProductName())
                        .append(" (x").append(item.getQuantity()).append(")")
                        .append("</td>")
                        .append("<td style='padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;'>")
                        .append(String.format("%,.0f", item.getTotalPrice())).append(" VND")
                        .append("</td>")
                        .append("</tr>");
            }

            String emailContent = "<!DOCTYPE html>" +
                    "<html lang='vi'>" +
                    "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>" +
                    "body { font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; color: #333; }" +
                    ".container { max-width: 700px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden; }" +
                    ".header { background-color: #4F46E5; color: #fff; padding: 30px 20px; text-align: center; }" +
                    ".header h1 { margin: 0; font-size: 26px; }" +
                    ".body { padding: 30px; font-size: 16px; line-height: 1.6; }" +
                    ".body p { margin-bottom: 12px; }" +
                    "table { width: 100%; border-collapse: collapse; margin-top: 20px; }" +
                    "th, td { font-size: 15px; padding: 12px 8px; border-bottom: 1px solid #eee; }" +
                    "th { background-color: #f4f4f4; text-align: left; }" +
                    ".summary p { font-size: 16px; margin: 8px 0; }" +
                    ".total { font-size: 18px; font-weight: bold; color: #4F46E5; margin-top: 20px; }" +
                    ".footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 14px; color: #555; }" +
                    ".footer a { color: #4F46E5; text-decoration: none; }" +
                    "@media (max-width: 600px) { .body, .header { padding: 20px; } table { font-size: 14px; } }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class='container'>" +

                    "<div class='header'>" +
                    "<h1>🎉 Cảm ơn bạn, " + userName + "!</h1>" +
                    "<p>Đơn hàng của bạn đã được xác nhận</p>" +
                    "</div>" +

                    "<div class='body'>" +
                    "<p><strong>🧾 Mã đơn hàng:</strong> " + order.getOrderId() + "</p>" +
                    "<p><strong>📦 Người nhận:</strong> " + order.getReceiverName() + "</p>" +
                    "<p><strong>📞 Số điện thoại:</strong> " + order.getPhoneNumber() + "</p>" +
                    "<p><strong>🏠 Địa chỉ giao hàng:</strong><br>" +
                    order.getShippingAddress().getStreet() + ", " +
                    order.getShippingAddress().getCommunes() + ", " +
                    order.getShippingAddress().getDistrict() + ", " +
                    order.getShippingAddress().getCity() + ", " +
                    order.getShippingAddress().getCountry() + "</p>" +

                    "<table>" +
                    "<thead>" +
                    "<tr><th>Sản phẩm</th><th style='text-align: right;'>Thành tiền</th></tr>" +
                    "</thead>" +
                    "<tbody>" + itemsHtml + "</tbody>" +
                    "</table>" +

                    "<div class='summary'>" +
                    "<p><strong>🚚 Phí vận chuyển:</strong> " + String.format("%,.0f", order.getShippingPrice()) + " VND</p>" +
                    "<p><strong>🎁 Giảm giá:</strong> -" + String.format("%,.0f", order.getDiscountAmount()) + " VND</p>" +
                    "<p class='total'>💰 Tổng thanh toán: " + String.format("%,.0f", order.getFinalPrice()) + " VND</p>" +
                    "</div>" +

                    "<p>Chúng tôi sẽ sớm xử lý và giao hàng cho bạn. Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua thông tin bên dưới.</p>" +
                    "<p style='margin-top: 20px;'>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của <strong>PTTech</strong>.</p>" +
                    "</div>" +

                    "<div class='footer'>" +
                    "<p>🌐 <a href='http://localhost:8080'>www.pttech.com</a> | ☎ 123-456-789</p>" +
                    "<p>📧 <a href='mailto:support@pttech.com'>support@pttech.com</a></p>" +
                    "</div>" +

                    "</div>" +
                    "</body>" +
                    "</html>";

            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(userEmail);
                helper.setSubject(subject);
                helper.setText(emailContent, true);
                mailSender.send(mimeMessage);
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }

    public void sendLoginSuccessNotificationEmail(User user, String loginMethod) {
        String subject = "🔐 Đăng Nhập Thành Công - PTTech";

        String emailContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; color: #333; }" +
                ".container { max-width: 700px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden; }" +
                ".header { background-color: #4F46E5; color: white; padding: 30px 20px; text-align: center; font-size: 26px; font-weight: bold; }" +
                ".body { padding: 30px; font-size: 16px; line-height: 1.6; }" +
                ".body ul { padding-left: 20px; }" +
                ".cta { display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }" +
                ".footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 14px; color: #555; }" +
                ".footer a { color: #4F46E5; text-decoration: none; }" +
                "@media (max-width: 600px) { .body, .header { padding: 20px; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +

                "<div class='header'>Xin chào " + user.getUsername() + " 👋</div>" +

                "<div class='body'>" +
                "<p>Chúng tôi xin thông báo rằng bạn đã đăng nhập thành công vào tài khoản <strong>PTTech</strong> bằng phương thức <strong>" + loginMethod + "</strong>.</p>" +
                "<p><strong>Thông tin đăng nhập:</strong></p>" +
                "<ul>" +
                "<li><b>Phương thức:</b> " + loginMethod + "</li>" +
                "<li><b>Tên đăng nhập:</b> " + user.getUsername() + "</li>" +
                "<li><b>Email:</b> " + user.getEmail() + "</li>" +
                "</ul>" +
                "<p>Nếu bạn không thực hiện hành động này, vui lòng <b>liên hệ với chúng tôi ngay</b> để đảm bảo an toàn cho tài khoản của bạn.</p>" +
                "<p>Bạn có thể truy cập tài khoản của mình tại đây:</p>" +
                "<a href='http://localhost:8080' class='cta'>🔗 Truy Cập Tài Khoản PTTech</a>" +
                "<p>Chúng tôi luôn cam kết bảo vệ thông tin cá nhân và mang đến trải nghiệm an toàn, tiện lợi cho bạn.</p>" +
                "</div>" +

                "<div class='footer'>" +
                "<p><strong>PTTech</strong></p>" +
                "<p>📍 01 Võ Văn Ngân, Linh Chiểu, TP. Thủ Đức, TP.HCM</p>" +
                "<p>🌐 <a href='http://localhost:8080'>www.pttech.com</a> | 📧 <a href='mailto:support@pttech.com'>support@pttech.com</a> | ☎ 123-456-789</p>" +
                "</div>" +

                "</div>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(emailContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    // Gửi email cảm ơn khi đăng ký nhận thông báo
    public void sendThankYouForSubscriptionEmail(User user) {
        String subject = "🎉 Cảm ơn bạn đã đăng ký nhận thông báo - PTTech";

        String emailContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; color: #333; }" +
                ".container { max-width: 650px; margin: 40px auto; background-color: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); overflow: hidden; }" +
                ".header { background-color: #4F46E5; color: white; padding: 30px 20px; text-align: center; font-size: 26px; font-weight: 700; }" +
                ".body { padding: 30px 25px; font-size: 16px; line-height: 1.6; }" +
                ".body p { margin-bottom: 18px; }" +
                ".cta { display: inline-block; background-color: #4F46E5; color: white; padding: 14px 30px; border-radius: 8px; font-weight: 600; text-decoration: none; margin: 25px auto 0; text-align: center; }" +
                ".footer { background-color: #f1f3f5; padding: 25px 20px; text-align: center; font-size: 14px; color: #666; }" +
                ".footer a { color: #4F46E5; text-decoration: none; }" +
                "@media (max-width: 600px) { .body, .header, .footer { padding-left: 15px; padding-right: 15px; } }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +

                "<div class='header'>Cảm ơn bạn, " + user.getUsername() + "!</div>" +

                "<div class='body'>" +
                "<p>Chúng tôi rất vui mừng khi bạn đã đăng ký nhận thông báo từ <strong>PTTech</strong>. Từ giờ bạn sẽ được cập nhật sớm nhất các tin tức, khuyến mãi và sản phẩm mới của chúng tôi.</p>" +
                "<p>Chúng tôi cam kết không gửi spam và luôn bảo vệ quyền riêng tư của bạn.</p>" +
                "<p>Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi qua email hoặc website.</p>" +
                "<p>Một lần nữa, cảm ơn bạn đã đồng hành cùng PTTech!</p>" +

                "<a href='http://localhost:8080' class='cta'>Khám phá sản phẩm mới</a>" +
                "</div>" +

                "<div class='footer'>" +
                "<p>Trân trọng,</p>" +
                "<p><strong>PTTech</strong></p>" +
                "<p>📍 01 Võ Văn Ngân, Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh</p>" +
                "<p>🌐 <a href='http://localhost:8080'>www.pttech.com</a> | 📧 <a href='mailto:support@pttech.com'>support@pttech.com</a> | ☎ 123-456-789</p>" +
                "</div>" +

                "</div>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(emailContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    // Gửi email thông báo hoàn tất trả hàng
    public void sendReturnCompletionEmail(Order order) {
        Optional<User> userOpt = userRepository.findById(order.getUserId().toString());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String userEmail = user.getEmail();
            String userName = user.getUsername();

            String subject = "🔔 Thông Báo Hoàn Tất Trả Hàng - PTTech";

            String emailContent = "<!DOCTYPE html>" +
                    "<html lang='vi'>" +
                    "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>" +
                    "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; color: #333; }" +
                    ".container { max-width: 650px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); overflow: hidden; }" +
                    ".header { background-color: #4F46E5; color: white; padding: 30px 20px; font-size: 26px; font-weight: 700; text-align: center; }" +
                    ".body { padding: 30px 25px; font-size: 16px; line-height: 1.6; }" +
                    ".body p { margin-bottom: 18px; }" +
                    "ul { padding-left: 20px; margin-bottom: 20px; }" +
                    "li { margin-bottom: 10px; }" +
                    ".highlight { font-weight: 700; color: #4F46E5; }" +
                    ".footer { background-color: #f1f3f5; padding: 25px 20px; text-align: center; font-size: 14px; color: #666; }" +
                    ".footer a { color: #4F46E5; text-decoration: none; }" +
                    "@media (max-width: 600px) { .body, .header, .footer { padding-left: 15px; padding-right: 15px; } }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class='container'>" +

                    "<div class='header'>Xin chào " + userName + ",</div>" +

                    "<div class='body'>" +
                    "<p>Chúng tôi vui mừng thông báo rằng yêu cầu trả hàng của bạn đã được <span class='highlight'>hoàn tất thành công</span>.</p>" +
                    "<p>Để tiến hành hoàn trả tiền cho đơn hàng, vui lòng cung cấp cho chúng tôi những thông tin sau:</p>" +
                    "<ul>" +
                    "<li><strong>Hình thức hoàn trả:</strong> Chuyển khoản, tiền mặt, hoặc phương thức khác</li>" +
                    "<li><strong>Thông tin tài khoản ngân hàng:</strong> (nếu bạn chọn chuyển khoản)</li>" +
                    "<li><strong>Số tiền cần hoàn trả:</strong> <span class='highlight'>" + String.format("%,.0f", order.getFinalPrice()) + " VND</span></li>" +
                    "</ul>" +
                    "<p>Vui lòng trả lời email này với các thông tin trên hoặc liên hệ trực tiếp với bộ phận hỗ trợ khách hàng của chúng tôi để được hỗ trợ nhanh chóng hơn.</p>" +
                    "<p>Chúng tôi rất trân trọng sự tin tưởng của bạn và mong được phục vụ bạn trong những lần tiếp theo.</p>" +
                    "</div>" +

                    "<div class='footer'>" +
                    "<p>Trân trọng,</p>" +
                    "<p><strong>PTTech</strong></p>" +
                    "<p>📍 01 Võ Văn Ngân, Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh</p>" +
                    "<p>🌐 <a href='http://localhost:8080'>www.pttech.com</a> | 📧 <a href='mailto:support@pttech.com'>support@pttech.com</a> | ☎ 123-456-789</p>" +
                    "</div>" +

                    "</div>" +
                    "</body>" +
                    "</html>";

            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(userEmail);
                helper.setSubject(subject);
                helper.setText(emailContent, true);
                mailSender.send(mimeMessage);
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }

    // Gửi email thông báo từ chối yêu cầu trả hàng
    public void sendReturnRejectionEmail(Order order) {
        Optional<User> userOpt = userRepository.findById(order.getUserId().toString());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String userEmail = user.getEmail();
            String userName = user.getUsername();

            String subject = "⚠️ Thông Báo Từ Chối Yêu Cầu Trả Hàng - PTTech";

            String emailContent = "<!DOCTYPE html>" +
                    "<html lang='vi'>" +
                    "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>" +
                    "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fafafa; margin: 0; padding: 0; color: #333; }" +
                    ".container { max-width: 650px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.1); overflow: hidden; }" +
                    ".header { background-color: #d9534f; color: white; padding: 28px 20px; font-size: 26px; font-weight: 700; text-align: center; }" +
                    ".body { padding: 30px 25px; font-size: 16px; line-height: 1.6; }" +
                    ".body p { margin-bottom: 18px; }" +
                    "ul { padding-left: 20px; margin-bottom: 20px; }" +
                    "li { margin-bottom: 10px; font-weight: 600; }" +
                    ".reason { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 12px 15px; border-radius: 6px; margin-bottom: 20px; }" +
                    ".footer { background-color: #f4f4f4; padding: 25px 20px; text-align: center; font-size: 14px; color: #555; }" +
                    ".footer a { color: #d9534f; text-decoration: none; font-weight: 600; }" +
                    "@media (max-width: 600px) { .body, .header, .footer { padding-left: 15px; padding-right: 15px; } }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class='container'>" +

                    "<div class='header'>Xin chào " + userName + ",</div>" +

                    "<div class='body'>" +
                    "<p>Chúng tôi rất tiếc phải thông báo rằng yêu cầu trả hàng của bạn <strong>không được chấp nhận</strong> trong trường hợp này.</p>" +
                    "<div class='reason'>" +
                    "<strong>Lý do từ chối:</strong> " + order.getReturnRejectionReason() +
                    "</div>" +
                    "<p>Chúng tôi hiểu sự bất tiện này và rất mong nhận được sự thông cảm từ bạn.</p>" +
                    "<p>Nếu bạn có bất kỳ câu hỏi hoặc cần thêm hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại dưới đây. Đội ngũ PTTech luôn sẵn sàng hỗ trợ bạn.</p>" +
                    "</div>" +

                    "<div class='footer'>" +
                    "<p>Trân trọng,</p>" +
                    "<p><strong>PTTech</strong></p>" +
                    "<p>📍 01 Võ Văn Ngân, Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh</p>" +
                    "<p>🌐 <a href='http://localhost:8080'>www.pttech.com</a> | 📧 <a href='mailto:support@pttech.com'>support@pttech.com</a> | ☎ 123-456-789</p>" +
                    "</div>" +

                    "</div>" +
                    "</body>" +
                    "</html>";

            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(userEmail);
                helper.setSubject(subject);
                helper.setText(emailContent, true);
                mailSender.send(mimeMessage);
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }
}