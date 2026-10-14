Feature: Arajet flight reservation
  As a passenger travelling with other adults
  I want to search for a flight and fill in every passenger's details
  So that I can continue with my reservation

  Background:
    Given Alice is on the Arajet home page

  Scenario Outline: Fill in the passenger details for <adults> adults on a round trip
    When Alice searches for a round trip using:
      | field       | value          |
      | origin      | <origin>       |
      | destination | <destination>  |
      | outDay      | <outDay>       |
      | arrivalDay  | <arrivalDay>   |
      | bundle      | <bundle>       |
      | adults      | <adults>       |
    Then she should see available outbound flights
    When she selects the "<bundle>" bundle for the outbound flight
    And she selects the "<bundle>" bundle for the return flight
    Then she should reach the passenger information step
    When she enters the details for <adults> passengers
    Then she should have all <adults> passengers ready to continue

    Examples:
      | origin | destination | outDay | arrivalDay | bundle  | adults |
      | MIA    | PUJ         | 15     | 22         | Comfort | 2      |
      | MIA    | PUJ         | 20     | 27         | Comfort | 3      |
      | MIA    | PUJ         | 25     | 32         | Comfort | 4      |

  # TODO: Implementar escenarios negativos
  # - Search with invalid dates
  # - Search with unavailable route
