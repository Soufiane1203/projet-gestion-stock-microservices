package com.monprojet.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.monprojet.product.dto.ProductDto;
import com.monprojet.product.security.RoleGuard;
import com.monprojet.product.service.ProductService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import(RoleGuard.class)
class ProductControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    void userCannotCreateProduct() throws Exception {
        ProductDto dto = sampleDto();
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(RoleGuard.HEADER_NAME, "USER")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanCreateProduct() throws Exception {
        ProductDto dto = sampleDto();
        when(productService.create(ArgumentMatchers.any(ProductDto.class))).thenReturn(dto);

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(RoleGuard.HEADER_NAME, "ADMIN")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    private ProductDto sampleDto() {
        ProductDto dto = new ProductDto();
        dto.setName("Test");
        dto.setSku("SKU-1");
        dto.setPrice(java.math.BigDecimal.TEN);
        dto.setCriticalThreshold(5);
        return dto;
    }
}
