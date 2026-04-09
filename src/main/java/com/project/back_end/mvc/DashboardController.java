package com.project.back_end.mvc;

import com.project.back_end.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class DashboardController {

    @Autowired
    private TokenService tokenService;

    @GetMapping("/")
    public String loginPage() {
        return "index";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboardRedirect() {
        return "redirect:/";
    }

    @GetMapping("/adminDashboard/{token}")
    public String adminDashboard(@PathVariable String token, Model model) {
        if (!tokenService.validateTokenForRole(token, "admin")) {
            return "redirect:/";
        }
        model.addAttribute("token", token);
        return "admin/adminDashboard";
    }

    @GetMapping("/doctor/dashboard")
    public String doctorDashboardRedirect() {
        return "redirect:/";
    }

    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable String token, Model model) {
        if (!tokenService.validateTokenForRole(token, "doctor")) {
            return "redirect:/";
        }
        Long doctorId = tokenService.getDoctorId(token);
        model.addAttribute("token", token);
        model.addAttribute("doctorId", doctorId);
        return "doctor/doctorDashboard";
    }

    @GetMapping("/patient/dashboard")
    public String patientDashboardRedirect() {
        return "redirect:/";
    }

    @GetMapping("/patientDashboard/{token}")
    public String patientDashboard(@PathVariable String token, Model model) {
        if (!tokenService.validateTokenForRole(token, "patient")) {
            return "redirect:/";
        }
        Long patientId = tokenService.getPatientId(token);
        model.addAttribute("token", token);
        model.addAttribute("patientId", patientId);
        return "patient/patientDashboard";
    }
}
