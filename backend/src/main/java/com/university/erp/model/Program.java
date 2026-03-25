package com.university.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Document(collection = "programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {

    @Id
    private Long id;

    private String name;   // e.g. B.Tech, M.Tech, MBA

    @Field(name = "duration_years")
    private int durationYears;

    @Field(name = "department_id")
    private Long departmentId;

    private List<TeamsChannel> channels;
}
