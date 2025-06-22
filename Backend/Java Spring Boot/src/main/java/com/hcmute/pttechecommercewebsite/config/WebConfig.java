package com.hcmute.pttechecommercewebsite.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Thư mục ad-images
        registry.addResourceHandler("/images/ad-images/**")
                .addResourceLocations("file:upload-images/ad-images/");

        // Thư mục brands
        registry.addResourceHandler("/images/brands/**")
                .addResourceLocations("file:upload-images/brands/");

        // Thư mục categories
        registry.addResourceHandler("/images/categories/**")
                .addResourceLocations("file:upload-images/categories/");

        // Thư mục products
        registry.addResourceHandler("/images/products/**")
                .addResourceLocations("file:upload-images/products/");

        // Thư mục products video
        registry.addResourceHandler("/videos/products/**")
                .addResourceLocations("file:upload-videos/products/");

        // Thư mục users
        registry.addResourceHandler("/images/users/**")
                .addResourceLocations("file:upload-images/users/");

        // Thư mục reviews
        registry.addResourceHandler("/images/reviews/**")
                .addResourceLocations("file:upload-images/reviews/");

        // Thư mục orders
        registry.addResourceHandler("/images/returns/**")
                .addResourceLocations("file:upload-images/returns/");

        // Thư mục orders videos
        registry.addResourceHandler("/videos/returns/**")
                .addResourceLocations("file:upload-videos/returns/");

        // Thư mục bugs
        registry.addResourceHandler("/images/bugs/**")
                .addResourceLocations("file:upload-images/bugs/");

        // Thư mục bugs videos
        registry.addResourceHandler("/videos/bugs/**")
                .addResourceLocations("file:upload-videos/bugs/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:8088", "http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);

        registry.addMapping("/images/**")
                .allowedOrigins("http://localhost:8088", "http://localhost:8080")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);

        registry.addMapping("/videos/**")
                .allowedOrigins("http://localhost:8088", "http://localhost:8080")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}