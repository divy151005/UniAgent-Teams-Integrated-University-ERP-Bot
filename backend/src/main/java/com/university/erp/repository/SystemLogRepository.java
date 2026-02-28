package com.university.erp.repository;

import com.university.erp.model.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findAllByOrderByTimestampDesc();
    List<SystemLog> findByMessageId(Long messageId);
    List<SystemLog> findTop50ByOrderByTimestampDesc();
    List<SystemLog> findByLevel(SystemLog.LogLevel level);
}
