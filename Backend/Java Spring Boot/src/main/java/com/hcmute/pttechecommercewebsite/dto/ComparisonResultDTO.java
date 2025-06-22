package com.hcmute.pttechecommercewebsite.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparisonResultDTO {
    private List<ProductDTO> products;
    private Map<String, String> evaluations;
}
