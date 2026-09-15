package com.Aniket.Webhook._Delivery_Platform_Backend.security;

import com.Aniket.Webhook._Delivery_Platform_Backend.repository.ApiKeyRepo;
import com.Aniket.Webhook._Delivery_Platform_Backend.util.HashUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class ApiKeyFilter extends HttpFilter {

    private final ApiKeyRepo apiKeyRepo;

    private static final String[] EXCLUDED_PATHS = {
            "/actuator/health",
            "/test-receiver",
            "/dev"
    };

    @Override
    protected void doFilter(HttpServletRequest request , HttpServletResponse response , FilterChain chain)throws IOException, ServletException
    {
        String path = request.getRequestURI();

        for(String excluded : EXCLUDED_PATHS){
            if(path.startsWith(excluded)){
                chain.doFilter(request,response);
                return;
            }
        }

        String apiKey = request.getHeader("X-API-KEY");

        if(apiKey == null || apiKey.isBlank()){
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing API key");
            return;
        }

        String hashedKey = HashUtil.sha256(apiKey);

        if(apiKeyRepo.findByHashedKeyAndActiveTrue(hashedKey).isEmpty()){
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid API key");
            return;
        }

        chain.doFilter(request,response);
    }

}
