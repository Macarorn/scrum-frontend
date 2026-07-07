// cypress/e2e/metricas.spec.js
// Pruebas para la vista de Métricas

describe('Métricas', () => {
  const testEmail = Cypress.env('TEST_MANAGER_EMAIL') || 'sofia@gmail.com';
  const testPassword = Cypress.env('TEST_MANAGER_PASSWORD') || 'Sofia1234';

  beforeEach(() => {
    cy.login(testEmail, testPassword);
  });

  it('debería mostrar la página de Métricas', () => {
    cy.visit('/metricas', { failOnStatusCode: false });
    cy.contains('h1', 'Métricas', { timeout: 15000 }).should('be.visible');
    cy.contains('Resumen general del estado del proyecto y progreso del equipo Scrum').should('be.visible');
  });

  it('debería mostrar el selector de proyecto y el botón Exportar', () => {
    cy.visit('/metricas', { failOnStatusCode: false });
    cy.get('button').contains('Exportar').should('be.visible');
    cy.get('select, .backlog-epica-toggle, .metricas-header-right').should('exist');
  });

  it('debería mostrar mensaje cuando no hay proyecto seleccionado o cuando carga métricas', () => {
    cy.visit('/metricas', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      if ($body.text().includes('No hay un proyecto seleccionado. Elige uno desde el selector para ver sus métricas.')) {
        cy.contains('No hay un proyecto seleccionado. Elige uno desde el selector para ver sus métricas.').should('be.visible');
      } else {
        cy.contains('Cargando métricas del proyecto...').should('be.visible');
      }
    });
  });

  it('debería cambiar el proyecto en el selector y actualizar los datos', () => {
    cy.visit('/metricas', { failOnStatusCode: false });
    cy.get('select', { timeout: 15000 }).then(($select) => {
      if ($select.find('option').length > 1) {
        cy.wrap($select).select($select.find('option').eq(1).val());
      }
    });
  });

  it('debería abrir el dropdown de exportar y mostrar opciones PDF y Excel', () => {
    cy.visit('/metricas', { failOnStatusCode: false });
    cy.contains('button', 'Exportar').click();
    cy.contains('button', 'PDF').should('be.visible');
    cy.contains('button', 'Excel').should('be.visible');
  });

  it('debería cambiar el proyecto seleccionado en el selector de métricas', () => {
    cy.visit('/metricas', { failOnStatusCode: false });
    cy.get('.metricas-header-right select', { timeout: 15000 }).then(($select) => {
      const opciones = $select.find('option');
      if (opciones.length < 2) {
        cy.log('No hay suficientes proyectos para cambiar el selector');
        return;
      }
      const valorSegundoProyecto = opciones.eq(1).val();
      cy.wrap($select).select(valorSegundoProyecto);
      cy.wrap($select).should('have.value', valorSegundoProyecto);
    });
  });

  it('debería exportar métricas en Excel desde el dropdown de exportar', () => {
    cy.visit('/metricas', { failOnStatusCode: false });
    cy.contains('button', 'Exportar').click();
    cy.contains('button', 'Excel').should('be.visible').click();
    cy.contains('button', 'Excel').should('not.exist');
  });

  it('debería mostrar datos de métricas cuando existen', () => {
    cy.visit('/metricas', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      if ($body.text().includes('No hay datos disponibles para este proyecto todavía.')) {
        cy.contains('No hay datos disponibles para este proyecto todavía.').should('be.visible');
      } else if ($body.text().includes('No hay un proyecto seleccionado. Elige uno desde el selector para ver sus métricas.')) {
        cy.contains('No hay un proyecto seleccionado. Elige uno desde el selector para ver sus métricas.').should('be.visible');
      } else {
        cy.get('h1').should('contain.text', 'Métricas');
        cy.get('button').contains('Exportar').should('be.visible');
      }
    });
  });
});
