package com.monprojet.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.monprojet.order.dto.OrderDto;
import com.monprojet.order.security.RoleGuard;
import com.monprojet.order.service.OrderService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@Import(RoleGuard.class)
class OrderControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @Test
    void userOrderRequestsAreForcedToPendingApproval() throws Exception {
        OrderDto dto = sampleOrder();
        dto.setStatus("CONFIRMED");
        when(orderService.create(org.mockito.ArgumentMatchers.any(OrderDto.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/orders")
                        .header(RoleGuard.HEADER_NAME, "USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());

        ArgumentCaptor<OrderDto> captor = ArgumentCaptor.forClass(OrderDto.class);
        verify(orderService).create(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo("PENDING_APPROVAL");
    }

    @Test
    void userCannotUpdateOrders() throws Exception {
        OrderDto dto = sampleOrder();
        mockMvc.perform(put("/orders/1")
                        .header(RoleGuard.HEADER_NAME, "USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    private OrderDto sampleOrder() {
        OrderDto dto = new OrderDto();
        dto.setProductId(1L);
        dto.setSupplierId(1L);
        dto.setQuantity(5);
        dto.setStatus("CREATED");
        return dto;
    }
}
