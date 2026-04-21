package com.example.The_Clinic_Car_Wash_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class TheClinicCarWashBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TheClinicCarWashBackendApplication.class, args);
	}

}
