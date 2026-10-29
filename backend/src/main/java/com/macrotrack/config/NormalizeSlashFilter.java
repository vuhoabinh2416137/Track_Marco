package com.macrotrack.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class NormalizeSlashFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest httpRequest) {
            String uri = httpRequest.getRequestURI();
            if (uri != null && uri.contains("//")) {
                String normalized = uri.replaceAll("/+", "/");
                httpRequest.getRequestDispatcher(normalized).forward(request, response);
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
