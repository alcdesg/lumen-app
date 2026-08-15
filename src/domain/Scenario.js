/**
 * Scenario.js
 * 
 * Domain entity representing an isolated simulation workspace / project ("Cenário").
 */
class Scenario {
  constructor({
    id,
    name,
    description = '',
    created_at,
    updated_at,
    archived_at = null,
    created_by_user = null,
    user_id = null
  }) {
    this.id = id || `scen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name ? name.trim() : '';
    this.description = description ? description.trim() : '';
    this.created_at = created_at || new Date().toISOString();
    this.updated_at = updated_at || new Date().toISOString();
    this.archived_at = archived_at || null;
    this.created_by_user = created_by_user || null;
    this.user_id = user_id || null;
  }

  validate() {
    if (!this.name) {
      throw new Error('O nome do cenário é obrigatório.');
    }
    return true;
  }

  isArchived() {
    return !!this.archived_at;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Scenario;
}
