package com.ong.backend.specifications;

import com.ong.backend.models.PerfilUsuario;
import com.ong.backend.models.Usuario;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UsuarioSpecs {

    public static Specification<Usuario> comFiltros(String nome, String email, String perfil) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (nome != null && !nome.trim().isEmpty()) {
                predicates.add(builder.like(builder.lower(root.get("nome")), "%" + nome.toLowerCase() + "%"));
            }

            if (email != null && !email.trim().isEmpty()) {
                predicates.add(builder.like(builder.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
            }

            if (perfil != null && !perfil.trim().isEmpty()) {
                try {
                    predicates.add(builder.equal(root.get("perfil"), PerfilUsuario.valueOf(perfil.toUpperCase())));
                } catch (IllegalArgumentException e) {
                }
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}