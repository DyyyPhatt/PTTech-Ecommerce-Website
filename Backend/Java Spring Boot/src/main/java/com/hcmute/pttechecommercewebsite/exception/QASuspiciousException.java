package com.hcmute.pttechecommercewebsite.exception;

import java.util.List;

public class QASuspiciousException extends RuntimeException {
    private final List<String> reasons;

    public QASuspiciousException(String message, List<String> reasons) {
        super(message);
        this.reasons = reasons;
    }

    public List<String> getReasons() {
        return reasons;
    }
}
