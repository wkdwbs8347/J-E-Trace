package com.jetrace.backend.studentDao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;

import com.jetrace.backend.studentDto.StudentDto;

@Mapper
public interface StudentDao {

    @Select("SELECT COUNT(*) FROM users WHERE login_id = #{loginId}")
    int countByLoginId(String loginId);

    @Insert("""
        INSERT INTO users (login_id, email, password, name, role)
        VALUES (#{loginId}, #{email}, #{password}, #{name}, #{role})
    """)
    void insertStudent(
        String loginId,
        String email,
        String password,
        String name,
        String role
    );

    @Select("SELECT * FROM users WHERE login_id = #{loginId}")
    StudentDto findByLoginId(String loginId);
}