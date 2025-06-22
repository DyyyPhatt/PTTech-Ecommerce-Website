package com.hcmute.pttechecommercewebsite.repository;

import com.hcmute.pttechecommercewebsite.model.ReportBug;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportBugRepository extends MongoRepository<ReportBug, String> {
    List<ReportBug> findByIsDeletedFalse();
    List<ReportBug> findByStatusAndIsDeletedFalse(ReportBug.BugStatus status);
    List<ReportBug> findByBugTypeAndIsDeletedFalse(String bugType);
    List<ReportBug> findByStatusAndBugTypeAndIsDeletedFalse(ReportBug.BugStatus status, String bugType);
}