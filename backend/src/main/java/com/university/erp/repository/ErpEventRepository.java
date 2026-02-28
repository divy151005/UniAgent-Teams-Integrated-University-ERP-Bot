package com.university.erp.repository;

import com.university.erp.model.ErpEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ErpEventRepository extends JpaRepository<ErpEvent, String> {
    List<ErpEvent> findAllByOrderByCreatedAtDesc();
    List<ErpEvent> findByDepartmentIgnoreCase(String department);
    List<ErpEvent> findByEventType(String eventType);
}
