## Purpose

The API reference generated from the published type declarations, and its addresses.

## ADDED Requirements

### Requirement: Generated reference

The site SHALL contain an API reference generated from the type declarations the package publishes, with its own sidebar.

#### Scenario: The index
- **WHEN** a reader opens `/docs/<version>/api/`
- **THEN** an index of classes, interfaces, enumerations, type aliases and variables is shown, with a sidebar of the reference

### Requirement: API addresses keep working

Class and interface pages SHALL keep their addresses, type aliases and variables SHALL stay on the index page, and the former enumeration addresses SHALL lead to the enumeration pages.

#### Scenario: A class page
- **WHEN** a reader opens `/docs/<version>/api/classes/Chart.html`
- **THEN** the reference page of `Chart` is shown

#### Scenario: An interface page
- **WHEN** a reader opens `/docs/<version>/api/interfaces/Plugin.html`
- **THEN** the reference page of `Plugin` is shown

#### Scenario: A former enumeration address
- **WHEN** a reader opens `/docs/<version>/api/enums/UpdateModeEnum.html`
- **THEN** they are taken to the page of `UpdateModeEnum`

#### Scenario: A type alias linked from a guide
- **WHEN** a reader follows the `Color` link on the colors guide page
- **THEN** they land on the entry of `Color` on the API index page
