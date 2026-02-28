package com.university.erp.repository;

import com.university.erp.model.ErpEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ErpEventRepository extends MongoRepository<ErpEvent, String> {
    List<ErpEvent> findAllByOrderByCreatedAtDesc();
    List<ErpEvent> findByDepartmentIgnoreCase(String department);
    List<ErpEvent> findByEventType(String eventType);
}
