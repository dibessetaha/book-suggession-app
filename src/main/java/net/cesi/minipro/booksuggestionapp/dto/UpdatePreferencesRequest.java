package net.cesi.minipro.booksuggestionapp.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferencesRequest {
    private List<String> genres;
    private List<String> authors;
}