describe('Items Table', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/items*', {
      fixture: 'items.json',
    }).as('getItems');

    cy.visit('/');
    cy.wait('@getItems');
  });

  it('displays the items table with correct headers', () => {
    cy.get('[data-testid="items-table"]').should('be.visible');
    cy.get('[data-testid="items-table"]').contains('Item Name');
    cy.get('[data-testid="items-table"]').contains('Sell Price');
    cy.get('[data-testid="items-table"]').contains('Buy Price');
  });

  it('filters items by search', () => {
    cy.get('[data-testid="search-input"]').type('Abyssal whip');
    cy.wait('@getItems');
    cy.get('[data-testid="items-table"]').should('contain', 'Abyssal whip');
    cy.get('[data-testid="items-table"]').should('not.contain', 'Dragon bones');
  });

  it('filters items by price range', () => {
    cy.get('[data-testid="min-high-input"]').type('50000');
    cy.wait('@getItems');
    cy.get('[data-testid="items-table"]').should('contain', 'Abyssal whip');
    cy.get('[data-testid="items-table"]').should('not.contain', 'Dragon bones');
  });

  it('filters items by membership status', () => {
    cy.get('[data-testid="membership-select"]').click();
    cy.get('[data-value="true"]').click();
    cy.wait('@getItems');
    cy.get('[data-testid="items-table"]').should('contain', 'Abyssal whip');
    cy.get('[data-testid="items-table"]').should('not.contain', 'Dragon bones');
  });

  it('sorts items by name', () => {
    cy.get('[data-testid="items-table"]').contains('th', 'Item Name').click();
    cy.wait('@getItems');
    cy.get('[data-testid="items-table"]').contains('th', 'Item Name').should('have.attr', 'aria-sort', 'ascending');
  });

  it('shows item details on row click', () => {
    cy.get('[data-testid="items-table"]').contains('Abyssal whip').click();
    cy.get('[data-testid="item-details-dialog"]').should('be.visible');
    cy.get('[data-testid="item-details-dialog"]').should('contain', 'Abyssal whip');
  });

  it('handles pagination', () => {
    cy.get('[data-testid="items-table"]').find('[aria-label="Go to next page"]').click();
    cy.wait('@getItems');
    cy.get('[data-testid="items-table"]').find('[aria-label="Page 2"]').should('be.visible');
  });

  it('resets filters', () => {
    cy.get('[data-testid="search-input"]').type('Abyssal whip');
    cy.get('[data-testid="min-high-input"]').type('50000');
    cy.get('[data-testid="reset-filters-button"]').click();
    cy.get('[data-testid="search-input"]').should('have.value', '');
    cy.get('[data-testid="min-high-input"]').should('have.value', '');
  });

  it('shows loading state', () => {
    cy.intercept('GET', '**/api/items*', {
      delay: 1000,
      fixture: 'items.json',
    }).as('getItemsDelayed');

    cy.get('[data-testid="search-input"]').type('test');
    cy.get('[data-testid="loading-indicator"]').should('be.visible');
    cy.wait('@getItemsDelayed');
    cy.get('[data-testid="loading-indicator"]').should('not.exist');
  });

  it('shows error state', () => {
    cy.intercept('GET', '**/api/items*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('getItemsError');

    cy.get('[data-testid="search-input"]').type('test');
    cy.wait('@getItemsError');
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to fetch data');
  });
}); 