Feature: Flight Search API
  As an API consumer
  I want to search for available flights
  So that I can plan trips

  Scenario: Get available routes
    Given the API is available
    When I request the available routes
    Then I should receive a successful response
