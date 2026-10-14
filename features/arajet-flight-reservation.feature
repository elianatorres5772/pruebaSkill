Feature: Arajet flight reservation
  As a passenger
  I want to search for a flight and choose my seats
  So that I can continue with my reservation

  Background:
    Given Alice is on the Arajet home page

  Scenario Outline: Search and select seats for a round trip
    When Alice searches for a round trip using:
      | field       | value          |
      | origin      | <origin>       |
      | destination | <destination>  |
      | outDay      | <outDay>       |
      | arrivalDay  | <arrivalDay>   |
      | bundle      | <bundle>       |
    Then she should see available outbound flights
    When she selects the "<bundle>" bundle for the outbound flight
    And she selects the "<bundle>" bundle for the return flight
    Then she should reach the passenger information step
    When she enters the passenger details
    And she continues to seat selection
    Then she should see the seat map
    When she selects an available seat for each flight
    Then she should see seats assigned for both flights

    Examples:
      | origin | destination | outDay | arrivalDay | bundle  |
      | MIA    | PUJ         | 15     | 22         | Comfort |
      | MIA    | PUJ         | 20     | 27         | Comfort |
      | MIA    | PUJ         | 25     | 32         | Comfort |

  # TODO: Implementar escenarios negativos
  # - Search with invalid dates
  # - Select unavailable seat
  # - Search with unavailable route
