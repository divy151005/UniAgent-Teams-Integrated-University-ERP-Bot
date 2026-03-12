package com.university.erp.repository;

import com.university.erp.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    List<Department> findBySchoolId(String schoolId);
    Optional<Department> findByCodeIgnoreCase(String code);
    Optional<Department> findByNameContainingIgnoreCase(String name);
}
