package com.generator;


import com.generator.xml.City;
import com.generator.xml.CityList;
import com.generator.xml.XmlBuilder;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

@SpringBootApplication
public class GeneratorApplication {

    public static void main(String[] args) {
        SpringApplication.run(GeneratorApplication.class, args);
        listCity();
    }
    public static List<City> listCity() {
        // 读取XML文件
        CityList cityList = null;
        try {
            Resource resource = new ClassPathResource("generator/html/city.xml");
            BufferedReader br = new BufferedReader(new InputStreamReader(resource.getInputStream(), "utf-8"));
            StringBuffer buffer = new StringBuffer();
            String line = "";
            while ((line = br.readLine()) !=null) {
                buffer.append(line);
            }
            br.close();
            // XML转为Java对象
            cityList = (CityList) XmlBuilder.xmlStrToOject(CityList.class, buffer.toString());
        }catch (Exception e){

        }

        return cityList.getCityList();
    }

}
