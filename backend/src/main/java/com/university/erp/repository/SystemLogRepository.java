package com.university.erp.repository;

import com.university.erp.model.SystemLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemLogRepository extends MongoRepository<SystemLog, String> {
    List<SystemLog> findAllByOrderByTimestampDesc();
    List<SystemLog> findByMessageId(String messageId);
    List<SystemLog> findTop50ByOrderByTimestampDesc();
    List<SystemLog> findByLevel(SystemLog.LogLevel level);
}
