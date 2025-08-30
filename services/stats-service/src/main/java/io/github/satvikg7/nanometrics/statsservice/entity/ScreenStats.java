package io.github.satvikg7.nanometrics.statsservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreenStats {

  @Field("screenWidth")
  private String screenWidth;

  @Field("count")
  private Long count;
}
