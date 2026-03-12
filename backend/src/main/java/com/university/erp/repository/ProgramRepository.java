package com.university.erp.repository;

import com.university.erp.model.Program;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProgramRepository extends MongoRepository<Program, String> {
    List<Program> findByDepartmentId(String departmentId);
}
