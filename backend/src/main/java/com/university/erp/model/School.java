package com.university.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Document(collection = "schools")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class School {

    @Id
    private String id;

    private String name;

    private String code;

    private List<Department> departments;
}
