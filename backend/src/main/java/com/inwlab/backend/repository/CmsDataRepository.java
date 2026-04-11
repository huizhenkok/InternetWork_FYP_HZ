package com.inwlab.backend.repository;

import com.inwlab.backend.entity.CmsData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CmsDataRepository extends JpaRepository<CmsData, String> {
}