package com.university.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.*;

@Document(collection = "teams_channels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamsChannel {

    @Id
    @Field(name = "channel_id")
    private String channelId;    // e.g. CH001

    @Field(name = "channel_name")
    private String channelName;  // e.g. CSE_BTech_1st_Year

    @Field(name = "academic_year")
    private int year;            // academic year 1-4

    private String section;      // A, B, C...

    @Field(name = "member_count")
    private int memberCount;

@Field(name = "program_id")
    private String programId;

    @Field(name = "ms_team_id")
    private String msTeamId;     // Microsoft Teams Group ID e.g. 19:abc@thread.tacv2

    @Field(name = "ms_channel_id")
    private String msChannelId;  // Microsoft Teams Channel ID e.g. 19:def@thread.v2

    private boolean active;
}
