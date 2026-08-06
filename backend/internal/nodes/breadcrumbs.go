package nodes

import (
	"context"
	"database/sql"
)

type Breadcrumb struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// buildBreadcrumbs uses a recursive CTE to trace a node's ancestry up to the root folder.
func BuildBreadcrumbs(ctx context.Context, db *sql.DB, nodeID string, userID string) ([]Breadcrumb, error) {
	query := `
	WITH RECURSIVE ancestor_nodes AS (
		SELECT id, parent_id, name, 0 AS depth
		FROM nodes
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL

		UNION ALL

		SELECT n.id, n.parent_id, n.name, a.depth + 1
		FROM nodes n
		JOIN ancestor_nodes a ON n.id = a.parent_id
		WHERE n.user_id = ? AND n.deleted_at IS NULL
	)
	SELECT id, name
	FROM ancestor_nodes
	ORDER BY depth DESC
	`

	rows, err := db.QueryContext(ctx, query, nodeID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var breadcrumbs []Breadcrumb
	for rows.Next() {
		var b Breadcrumb
		if err := rows.Scan(&b.ID, &b.Name); err != nil {
			return nil, err
		}
		breadcrumbs = append(breadcrumbs, b)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if breadcrumbs == nil {
		breadcrumbs = []Breadcrumb{}
	}

	return breadcrumbs, nil
}
