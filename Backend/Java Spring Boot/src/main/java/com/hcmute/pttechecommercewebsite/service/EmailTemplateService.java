package com.hcmute.pttechecommercewebsite.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String getVerificationSuccessPage() {
        return "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Xác Thực Thành Công - PTTech</title>" +
                "<style>" +
                "body {" +
                "  margin: 0;" +
                "  padding: 0;" +
                "  background: linear-gradient(135deg, #e0f0ff, #ffffff);" +
                "  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;" +
                "  color: #333;" +
                "  display: flex;" +
                "  justify-content: center;" +
                "  align-items: center;" +
                "  height: 100vh;" +
                "}" +
                ".container {" +
                "  background: white;" +
                "  max-width: 500px;" +
                "  width: 90%;" +
                "  padding: 40px 30px;" +
                "  border-radius: 12px;" +
                "  box-shadow: 0 10px 25px rgba(0, 86, 179, 0.15);" +
                "  text-align: center;" +
                "}" +
                ".icon {" +
                "  font-size: 60px;" +
                "  color: #007bff;" +
                "  margin-bottom: 20px;" +
                "  animation: popIn 0.6s ease forwards;" +
                "}" +
                "@keyframes popIn {" +
                "  0% { transform: scale(0); opacity: 0; }" +
                "  100% { transform: scale(1); opacity: 1; }" +
                "}" +
                ".header {" +
                "  font-size: 28px;" +
                "  font-weight: 700;" +
                "  color: #0056b3;" +
                "  margin-bottom: 15px;" +
                "}" +
                ".content {" +
                "  font-size: 17px;" +
                "  color: #555;" +
                "  line-height: 1.6;" +
                "  margin-bottom: 30px;" +
                "}" +
                ".content a {" +
                "  color: #007bff;" +
                "  text-decoration: none;" +
                "  font-weight: 600;" +
                "}" +
                ".content a:hover {" +
                "  text-decoration: underline;" +
                "}" +
                ".cta {" +
                "  background-color: #0056b3;" +
                "  color: white;" +
                "  padding: 14px 35px;" +
                "  font-weight: 700;" +
                "  font-size: 17px;" +
                "  border-radius: 8px;" +
                "  text-decoration: none;" +
                "  display: inline-block;" +
                "  transition: background-color 0.3s ease;" +
                "}" +
                ".cta:hover {" +
                "  background-color: #00408a;" +
                "}" +
                ".footer {" +
                "  margin-top: 40px;" +
                "  font-size: 14px;" +
                "  color: #888;" +
                "}" +
                "@media (max-width: 480px) {" +
                "  .container {" +
                "    padding: 30px 20px;" +
                "  }" +
                "  .header {" +
                "    font-size: 24px;" +
                "  }" +
                "  .cta {" +
                "    padding: 12px 25px;" +
                "    font-size: 16px;" +
                "  }" +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "  <div class='icon'>✅</div>" +
                "  <div class='header'>Xác Thực Tài Khoản Thành Công!</div>" +
                "  <div class='content'>" +
                "    <p>Chúc mừng! Tài khoản của bạn đã được xác thực thành công.</p>" +
                "    <p>Giờ đây, bạn có thể bắt đầu sử dụng các dịch vụ của PTTech.</p>" +
                "    <p>Nếu có bất kỳ vấn đề gì, vui lòng liên hệ với chúng tôi qua email " +
                "       <a href='mailto:support@pttech.com'>support@pttech.com</a>.</p>" +
                "  </div>" +
                "  <a href='http://localhost:8080' class='cta'>Trở về trang chủ</a>" +
                "  <div class='footer'>Trân trọng,<br>PTTech</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    public String getVerificationFailurePage() {
        return "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Xác Thực Thất Bại - PTTech</title>" +
                "<style>" +
                "body {" +
                "  margin: 0;" +
                "  padding: 0;" +
                "  background: linear-gradient(135deg, #ffe6e6, #fff7f7);" +
                "  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;" +
                "  color: #333;" +
                "  display: flex;" +
                "  justify-content: center;" +
                "  align-items: center;" +
                "  height: 100vh;" +
                "}" +
                ".container {" +
                "  background: white;" +
                "  max-width: 500px;" +
                "  width: 90%;" +
                "  padding: 40px 30px;" +
                "  border-radius: 12px;" +
                "  box-shadow: 0 10px 25px rgba(217, 83, 79, 0.2);" +
                "  text-align: center;" +
                "  border: 2px solid #d9534f;" +
                "}" +
                ".icon {" +
                "  font-size: 60px;" +
                "  color: #d9534f;" +
                "  margin-bottom: 20px;" +
                "  animation: shake 0.6s ease-in-out;" +
                "}" +
                "@keyframes shake {" +
                "  0%, 100% { transform: translateX(0); }" +
                "  20%, 60% { transform: translateX(-10px); }" +
                "  40%, 80% { transform: translateX(10px); }" +
                "}" +
                ".header {" +
                "  font-size: 28px;" +
                "  font-weight: 700;" +
                "  color: #d9534f;" +
                "  margin-bottom: 15px;" +
                "}" +
                ".content {" +
                "  font-size: 17px;" +
                "  color: #555;" +
                "  line-height: 1.6;" +
                "  margin-bottom: 30px;" +
                "}" +
                ".cta {" +
                "  background-color: #d9534f;" +
                "  color: white;" +
                "  padding: 14px 35px;" +
                "  font-weight: 700;" +
                "  font-size: 17px;" +
                "  border-radius: 8px;" +
                "  text-decoration: none;" +
                "  display: inline-block;" +
                "  transition: background-color 0.3s ease;" +
                "}" +
                ".cta:hover {" +
                "  background-color: #b52b27;" +
                "}" +
                ".footer {" +
                "  margin-top: 40px;" +
                "  font-size: 14px;" +
                "  color: #888;" +
                "}" +
                "@media (max-width: 480px) {" +
                "  .container {" +
                "    padding: 30px 20px;" +
                "  }" +
                "  .header {" +
                "    font-size: 24px;" +
                "  }" +
                "  .cta {" +
                "    padding: 12px 25px;" +
                "    font-size: 16px;" +
                "  }" +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "  <div class='icon'>❌</div>" +
                "  <div class='header'>Xác Thực Thất Bại!</div>" +
                "  <div class='content'>" +
                "    <p>Xin lỗi, mã xác thực của bạn đã hết hạn hoặc không hợp lệ.</p>" +
                "    <p>Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ của chúng tôi nếu cần giúp đỡ.</p>" +
                "  </div>" +
                "  <a href='mailto:support@pttech.com' class='cta'>Liên hệ với chúng tôi</a>" +
                "  <div class='footer'>Trân trọng,<br>PTTech</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}