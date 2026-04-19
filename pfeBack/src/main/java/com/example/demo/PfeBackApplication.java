package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PfeBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(PfeBackApplication.class, args);
		System.out.println("✅ Spring Boot démarré sur http://localhost:8080");
    }
	
}



