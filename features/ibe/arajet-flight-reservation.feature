Feature: Arajet flight reservation
  As a passenger travelling with other adults, children and infants
  I want to search for a flight, fill in every passenger's details and choose extra services
  So that I can pay for my reservation with a credit card and get it confirmed

  Children are 2 to 12 years old and infants 0 to 2 years old.
  Each infant travels with an adult, so there cannot be more infants than adults.
  The outbound flight is the first one leaving between 4 and 24 hours from now, so the booking can be checked in
  (check-in opens 24 hours before departure). arrivalDay is the return date, in days from today.

  Background:
    Given Alice is on the Arajet home page

  # extras column: items separated by ";", each one as extra[:passenger[:flight[:quantity]]]
  #   extra: the name or the position of the extra, e.g. "1; 5:all:both; 3:1:outbound:2"
  # Extras for the whole booking (no passenger, flight or quantity):
  #   1 Asistencia en Viaje, 2 Reembolso Flex
  # Extras per passenger:
  #   3 Equipaje en Bodega 23 kg, 4 Equipaje en cabina 12 kg, 5 Acceso Prioritario, 6 Pa' Picar Combo,
  #   7 Pa' Brindar Combo, 8 Instrumento Musical, 9 Equipaje Deportivo
  #   passenger: number in the extras list (adults first, then children; infants have no extras) or "all" (default)
  #   flight:    outbound, return or both (default)
  #   quantity:  total items per passenger and flight (default 1); only luggage with a counter allows more than 1
  Scenario Outline: Book a round trip with extras for <adults> adults, <children> children and <infants> infants
    When Alice searches for a round trip using:
      | field       | value          |
      | origin      | <origin>       |
      | destination | <destination>  |
      | arrivalDay  | <arrivalDay>   |
      | bundle      | <bundle>       |
      | adults      | <adults>       |
      | children    | <children>     |
      | infants     | <infants>      |
    Then she should see available outbound flights
    When she selects the "<bundle>" bundle for the outbound flight
    And she selects the "<bundle>" bundle for the return flight
    Then she should reach the passenger information step
    When she enters the details for <adults> adults, <children> children and <infants> infants
    Then she should have <adults> adults, <children> children and <infants> infants ready to continue
    When she continues to the seats and extras step
    And she selects random available seats
    Then she should have a seat on both flights for <adults> adults and <children> children
    # PENDING: UAT moved the extras to new baggage and extras pages, so the extras column is not used
    # until those steps are rebuilt. Meanwhile both pages are passed without adding anything.
    #When she adds the extras "<extras>"
    #Then she should see every chosen extra added
    When she continues to the review and payment step
    And she pays with a credit card using:
      | field  | value            |
      | number | 4000000000001000 |
      | expiry | 01/2027          |
      | cvv    | 123              |
    Then she should see the booking confirmed

    Examples:
      | origin | destination | arrivalDay | bundle  | adults | children | infants | extras                          |
      | MIA    | PUJ         | 8          | Classic | 2      | 0        | 0       | 1; 5                            |
      | MIA    | PUJ         | 9          | Classic | 2      | 1        | 1       | 2; 3:1:outbound:2; 6:3:return; 9:2 |
      #| MIA    | PUJ         | 8          | Classic | 3      | 2        | 0       | 4:all:both                      |
      #| MIA    | PUJ         | 9          | Classic | 4      | 0        | 2       | 7:4:outbound                    |

  # TODO: Implementar escenarios negativos
  # - Search with invalid dates
  # - Search with unavailable route
