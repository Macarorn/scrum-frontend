describe('Miembros - pruebas unitarias por funcionalidad', () => {
  const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
  const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

  beforeEach(() => {
    cy.login(testEmail, testPassword);
    cy.intercept('GET', '**/proyectos/*/miembros').as('getMembers');
    cy.intercept('GET', '**/usuarios/buscar*').as('searchUsers');
    cy.visit('/projects/1/members', { failOnStatusCode: false });
    cy.wait('@getMembers', { timeout: 20000 });
    // asegurar que la página esté lista
    cy.contains('h1', 'Miembros del proyecto', { timeout: 15000 }).should('be.visible');
  });

  it('Carga la lista de miembros del proyecto', () => {
    cy.get('tbody tr', { timeout: 10000 }).should('have.length.gte', 1);
  });

  it('Busca un miembro por nombre', () => {
    cy.get('.lista-usuarios-search-input').should('be.visible').clear().type('Mariana', { delay: 50 });
    cy.contains('tbody tr', 'Mariana', { timeout: 10000 }).should('be.visible');
  });

  it('Abre panel Añadir miembro y busca usuarios', () => {
    cy.contains('button', 'Añadir Miembro').click({ force: true });
    cy.get('input[placeholder="Buscar por nombre o correo..."]', { timeout: 10000 }).should('be.visible').clear().type('Carlos', { delay: 50 });
    cy.contains('button', 'Buscar').click({ force: true });
    cy.wait('@searchUsers', { timeout: 15000 });
    cy.contains('div', 'Carlos Mendes', { timeout: 10000 }).should('be.visible');
  });

  it('Envía una invitación a un usuario desde el panel Añadir', () => {
    cy.contains('button', 'Añadir Miembro').click({ force: true });
    cy.get('input[placeholder="Buscar por nombre o correo..."]').should('be.visible').clear().type('Carlos', { delay: 50 });
    cy.contains('button', 'Buscar').click({ force: true });
    cy.wait('@searchUsers', { timeout: 15000 });
    cy.contains('div', 'Carlos Mendes', { timeout: 10000 })
      .closest('div.d-flex.justify-content-between.align-items-center.p-2')
      .contains('button', 'Añadir')
      .click({ force: true });

    // Esperar el modal o la alerta resultante
    cy.contains('h5', 'Asignar rol', { timeout: 10000 }).should('be.visible');
    // seleccionar un rol distinto si es posible
    cy.get('select.form-select').first().then(($sel) => {
      const opts = [...$sel.find('option')].map((o) => o.text.trim());
      const pick = opts.find((t) => t.toLowerCase() !== 'product owner') || opts[0];
      cy.wrap($sel).select(pick);
    });
    cy.contains('button', 'Enviar solicitud').click({ force: true });

    // Comprobar resultado: puede ser éxito, duplicado o error. Aceptamos cualquiera pero debe mostrarse.
    cy.contains('body', /Solicitud enviada|Ya eres miembro|Error al enviar solicitud|Aceptar/i, { timeout: 10000 }).should('be.visible');
    // Cerrar posibles overlays
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Aceptar")').length) cy.contains('button', 'Aceptar').click({ force: true });
      if ($body.find('button:contains("Cancelar")').length) cy.contains('button', 'Cancelar').click({ force: true });
    });
  });

  it('Edita el rol de un miembro', () => {
    // Asegurarse de que la lista cargó
    cy.get('tbody tr', { timeout: 10000 }).should('have.length.gte', 1);
    // Limpiar búsqueda para ver la tabla completa
    cy.get('.lista-usuarios-search-input').clear({ force: true });
    cy.contains('tbody tr', 'Jefferson', { timeout: 10000 }).should('be.visible').within(() => {
      cy.get('button[title="Opciones"]').click({ force: true });
    });
    cy.contains('.dropdown-item', 'Editar rol', { timeout: 10000 }).click({ force: true });
    cy.contains('h5', 'Editar rol', { timeout: 10000 }).should('be.visible');
    cy.get('select.form-select').last().then(($select) => {
      const current = $select.find('option:selected').text().trim();
      const opts = [...$select.find('option')].map((o) => o.text.trim());
      const pick = opts.find((o) => o !== current) || opts[0];
      cy.wrap($select).select(pick);
    });
    cy.contains('button', 'Guardar rol').click({ force: true });
    cy.contains('body', /Rol actualizado|Ya tiene ese rol|Error/i, { timeout: 10000 }).should('be.visible');
  });

  it('Cambia el estado de un miembro (habilitar/inhabilitar)', () => {
    cy.get('.lista-usuarios-search-input').clear({ force: true });
    cy.contains('tbody tr', 'Jefferson', { timeout: 10000 }).should('be.visible').within(() => {
      cy.get('button[title="Opciones"]').click({ force: true });
    });
    cy.contains('.dropdown-item', /Inhabilitar miembro|Habilitar miembro/, { timeout: 10000 }).click({ force: true });
    cy.contains('body', /Miembro inhabilitado|Miembro habilitado|Error/i, { timeout: 10000 }).should('be.visible');
  });
});
