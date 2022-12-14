/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button, Form, Modal, Spinner, Tab, Tabs } from "react-bootstrap"
import { BiPlusMedical, BiTrash } from "react-icons/bi"
import PropTypes from "prop-types"

import { addEmployee, resetStatus, updateEmployee } from "~/redux/employeesSlice"
import { departmentsSelector, employeesSelector, teamsSelector } from "~/redux/selectors"
import FormSelectDepartment from "./FormSelectDepartment"
import FormSelectPosition from "./FormSelectPosition"
import FormSelectTeam from "./FormSelectTeam"
import { getDepartmentList } from "~/redux/departmentsSlice"
import { getTeamList } from "~/redux/teamsSlice"
import Swal from "sweetalert2"
import clsx from "clsx"

const propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    employee: PropTypes.object,
}

const FormSubmitEmployee = ({ visible, setVisible, employee = null }) => {
    const departments = useSelector(departmentsSelector).departments
    const teams = useSelector(teamsSelector).teams
    const status = useSelector(employeesSelector).status

    const dispatch = useDispatch()

    const [employeeInfo, setEmployeeInfo] = useState({
        code: "",
        name: "",
        avatar: "",
        dateOfBirth: "",
        gender: "0",
        email: "",
        phoneNumber: "",
        teams: [],
        departments: [{}],
        user: {
            username: "",
            enableLogin: false,
        },
    })
    const [tab, setTab] = useState("departments")

    let checkDepartment =
        employeeInfo.departments.length > 0 && Object.keys(employeeInfo.departments[0]).length > 0 && employeeInfo.departments[0].position?.name !== undefined

    useEffect(() => {
        dispatch(getDepartmentList())
        dispatch(getTeamList())
        if (employee?.id) {
            let data = {
                ...employee,
                user: employee.user.enableLogin !== false ? employee.user : { username: "" },
                departments: employee.departments.map((department, index) => {
                    return {
                        ...employee.departments[index],
                        positions: departments.find((dp) => dp.id === department.id)?.positions,
                    }
                }),
                teams: employee.teams.map((team, index) => {
                    return {
                        ...employee.teams[index],
                        positions: teams.find((tm) => tm.id === team.id)?.positions,
                    }
                }),
            }
            setEmployeeInfo(data)
        }
    }, [])
    useEffect(() => {
        if (status === "success") {
            setVisible(false)
            dispatch(resetStatus())
        }
    }, [status])

    /* C??c h??m thay ?????i gi?? tr??? c???a state employeeInfo m???i khi ng?????i d??ng nh???p/ch???n d??? li???u m???i */
    const handleInputChange = (e) => {
        if (e.target.type === "checkbox") {
            if (e.target.checked) {
                setEmployeeInfo({
                    ...employeeInfo,
                    user: {
                        username: null,
                        enableLogin: false,
                    },
                })
            } else {
                setEmployeeInfo({
                    ...employeeInfo,
                    user: {
                        username: employeeInfo.email,
                        enableLogin: true,
                    },
                })
            }
        } else {
            setEmployeeInfo({
                ...employeeInfo,
                [e.target.name]: e.target.value,
            })
        }
    }
    const handleUserChange = (e) => {
        setEmployeeInfo({
            ...employeeInfo,
            user: {
                ...employeeInfo.user,
                [e.target.name]: e.target.value,
            },
        })
    }
    const handleToggleLogin = (e) => {
        if (e.target.checked) {
            setEmployeeInfo({
                ...employeeInfo,
                user: {
                    username: employeeInfo.user.username || employeeInfo.email,
                    enableLogin: true,
                },
            })
        } else {
            setEmployeeInfo({
                ...employeeInfo,
                user: {
                    username: "",
                    enableLogin: false,
                },
            })
        }
    }
    //

    /* X??? l?? khi click v??o button Th??m ph??ng ban */
    const handleShowFormSelectDepartment = () => {
        if (employeeInfo.departments?.length === 0) {
            setEmployeeInfo({
                ...employeeInfo,
                departments: [{}],
            })
        } else {
            setEmployeeInfo({
                ...employeeInfo,
                departments: [...employeeInfo.departments, {}],
            })
        }
    }

    const handleDepartmentChange = (index, newDepartment) => {
        let newDepartments = employeeInfo.departments.map((department, key) => {
            if (key === index) {
                return {
                    ...newDepartment,
                    position: {},
                }
            }
            return department
        })
        setEmployeeInfo({
            ...employeeInfo,
            departments: newDepartments,
        })
    }

    const handlePositionOfDepartmentChange = (index, position) => {
        let newDepartments = employeeInfo.departments.map((department, key) => {
            if (key === index) {
                return {
                    ...department,
                    position,
                }
            }
            return department
        })
        setEmployeeInfo({
            ...employeeInfo,
            departments: newDepartments,
        })
    }

    const handleDeleteFormSelectDepartment = (index) => {
        const newDepartments = employeeInfo.departments.filter((e, idx) => index !== idx)
        setEmployeeInfo({
            ...employeeInfo,
            departments: newDepartments,
        })
    }
    //

    /* X??? l?? khi click v??o button Th??m ?????i nh??m */
    const handleShowFormSelectTeam = () => {
        if (employeeInfo.teams?.length === 0) {
            setEmployeeInfo({
                ...employeeInfo,
                teams: [{}],
            })
        } else {
            setEmployeeInfo({
                ...employeeInfo,
                teams: [...employeeInfo.teams, {}],
            })
        }
    }

    const handleTeamChange = (index, newTeam) => {
        let newTeams = employeeInfo.teams.map((team, key) => {
            if (key === index) {
                return {
                    ...newTeam,
                    position: {},
                }
            }
            return team
        })
        setEmployeeInfo({
            ...employeeInfo,
            teams: newTeams,
        })
    }

    const handlePositionOfTeamChange = (index, position) => {
        let newTeams = employeeInfo.teams.map((team, key) => {
            if (key === index) {
                return {
                    ...team,
                    position,
                }
            }
            return team
        })
        setEmployeeInfo({
            ...employeeInfo,
            teams: newTeams,
        })
    }

    const handleDeleteFormSelectTeam = (index) => {
        const newTeams = employeeInfo.teams.filter((e, idx) => index !== idx)
        setEmployeeInfo({
            ...employeeInfo,
            teams: newTeams,
        })
    }
    //

    /* X??? l?? Submit Form */
    const [validated, setValidated] = useState(false)
    const handleSubmit = (e) => {
        const form = e.currentTarget
        e.preventDefault()
        e.stopPropagation()
        setValidated(true)
        if (form.checkValidity() === true) {
            const Toast = Swal.mixin({
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 10000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer)
                    toast.addEventListener("mouseleave", Swal.resumeTimer)
                },
            })
            if (!checkDepartment) {
                Toast.fire({
                    title: "Th??m sinh vi??n",
                    text: "M???i sinh vi??n ph???i ??? t???i thi???u 1 ph??ng ban",
                    icon: "warning",
                })
                return
            }
            if (employeeInfo.id) {
                let data = {
                    ...employeeInfo,
                    modifyBy: 1,
                }
                data.departments?.forEach((department, index, array) => {
                    delete array[index].positions
                })
                if (data.hasOwnProperty("teams") === false) {
                    data.teams = []
                }
                data.teams?.forEach((team, index, array) => {
                    delete array[index].positions
                })
                dispatch(updateEmployee(data))
            } else {
                let data = {
                    ...employeeInfo,
                    createBy: 1,
                }
                data.departments?.forEach((department, index, array) => {
                    delete array[index].positions
                })
                data.teams?.forEach((team, index, array) => {
                    delete array[index].positions
                })
                dispatch(addEmployee(data))
            }
        }
    }
    //

    return (
        <Modal className="modal-fullheight" size="lg" backdrop="static" scrollable show={visible} onHide={() => setVisible(false)}>
            <Modal.Header closeButton>
                <Modal.Title className="text-white">{employee?.id ? "Ch???nh s???a sinh vi??n" : "Th??m sinh vi??n"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <div className="modal-body-content">
                        <div className="mb-4">
                            <Form.Label>
                                M?? sinh vi??n<span style={{ color: "red" }}>*</span>:
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="code"
                                placeholder="Nh???p m?? sinh vi??n..."
                                value={employeeInfo.code}
                                onChange={handleInputChange}
                                isInvalid={employeeInfo.code?.length > 10}
                                required
                            />
                            <Form.Control.Feedback type="invalid">M?? sinh vi??n kh??ng h???p l???.</Form.Control.Feedback>
                            M?? sinh vi??n kh??ng ???????c v?????t qu?? 10 k?? t???.
                        </div>
                        <div className="mb-4">
                            <Form.Label>
                                H??? v?? t??n<span style={{ color: "red" }}>*</span>:
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Nh???p h??? v?? t??n sinh vi??n..."
                                value={employeeInfo.name}
                                onChange={handleInputChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">Vui l??ng nh???p h??? v?? t??n sinh vi??n.</Form.Control.Feedback>
                        </div>
                        <div className="mb-4">
                            <Form.Label>
                                Ng??y sinh<span style={{ color: "red" }}>*</span>:
                            </Form.Label>
                            <Form.Control
                                type="date"
                                name="dateOfBirth"
                                max={new Date().toISOString().split("T")[0]}
                                placeholder="Nh???p ng??y sinh..."
                                value={employeeInfo.dateOfBirth || ""}
                                onChange={handleInputChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">Vui l??ng nh???p ng??y sinh.</Form.Control.Feedback>
                        </div>
                        <div className="mb-4">
                            <Form.Label>
                                Gi???i t??nh<span style={{ color: "red" }}>*</span>:
                            </Form.Label>
                            <Form.Select name="gender" value={employeeInfo.gender} onChange={handleInputChange} required>
                                <option value="0">N???</option>
                                <option value="1">Nam</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Vui l??ng ch???n gi???i t??nh.</Form.Control.Feedback>
                        </div>
                        <div className="mb-4">
                            <Form.Label>
                                Email<span style={{ color: "red" }}>*</span>:
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Nh???p email sinh vi??n..."
                                value={employeeInfo.email}
                                onChange={handleInputChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">Vui l??ng nh???p email.</Form.Control.Feedback>
                        </div>
                        <div className="mb-4">
                            <Form.Label>
                                S??? ??i???n tho???i<span style={{ color: "red" }}>*</span>:
                            </Form.Label>
                            <Form.Control
                                type="number"
                                name="phoneNumber"
                                placeholder="Nh???p s??? ??i???n tho???i c???a sinh vi??n..."
                                value={employeeInfo.phoneNumber}
                                onChange={handleInputChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">Vui l??ng nh???p s??? ??i???n tho???i.</Form.Control.Feedback>
                        </div>
                        <div className="card mb-4">
                            <Tabs activeKey={tab} onSelect={(k) => setTab(k)}>
                                <Tab eventKey="departments" title="Ph??ng ban">
                                    <div className="card-body">
                                        {employeeInfo.departments.map((department, index) => (
                                            <div key={index} className="list-group-item bg-light mb-4">
                                                <div className="d-flex flex-lg-row flex-column">
                                                    <div className="mb-4 mb-lg-0 col">
                                                        <Form.Label>Ph??ng ban s??? {index + 1}:</Form.Label>
                                                        <FormSelectDepartment
                                                            index={index}
                                                            currentDepartment={department}
                                                            onDepartmentChange={handleDepartmentChange}
                                                            departments={departments}
                                                            required
                                                            className={clsx({
                                                                "is-invalid": !checkDepartment,
                                                            })}
                                                        />
                                                    </div>
                                                    <div className="mb-4 ms-lg-3 col">
                                                        <Form.Label>Ch???c v??? c???a ph??ng ban s??? {index + 1}:</Form.Label>
                                                        <FormSelectPosition
                                                            index={index}
                                                            current={employeeInfo.departments[index]?.position}
                                                            positions={employeeInfo.departments[index]?.positions}
                                                            onChange={handlePositionOfDepartmentChange}
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline-danger"
                                                    className="d-block m-auto"
                                                    onClick={() => handleDeleteFormSelectDepartment(index)}
                                                >
                                                    <BiTrash /> X??a
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mb-4">
                                        <Button variant="outline-primary" className="d-block m-auto" onClick={handleShowFormSelectDepartment}>
                                            <BiPlusMedical /> Th??m ph??ng ban <BiPlusMedical />
                                        </Button>
                                    </div>
                                </Tab>
                                <Tab eventKey="teams" title="?????i nh??m">
                                    <div className="card-body">
                                        {employeeInfo.teams?.map((team, index) => (
                                            <div key={index} className="list-group-item bg-light mb-4">
                                                <div className="d-flex flex-lg-row flex-column">
                                                    <div className="mb-4 mb-lg-0 col">
                                                        <Form.Label>?????i nh??m s??? {index + 1}:</Form.Label>
                                                        <FormSelectTeam index={index} currentTeam={team} onTeamChange={handleTeamChange} teams={teams} />
                                                    </div>
                                                    <div className="mb-4 ms-lg-3 col">
                                                        <Form.Label>Ch???c v??? c???a ?????i nh??m s??? {index + 1}:</Form.Label>
                                                        <FormSelectPosition
                                                            index={index}
                                                            current={employeeInfo.teams[index]?.position}
                                                            positions={employeeInfo.teams[index]?.positions}
                                                            onChange={handlePositionOfTeamChange}
                                                        />
                                                    </div>
                                                </div>
                                                <Button variant="outline-danger" className="d-block m-auto" onClick={() => handleDeleteFormSelectTeam(index)}>
                                                    <BiTrash /> X??a
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mb-4">
                                        <Button variant="outline-primary" className="d-block m-auto" onClick={handleShowFormSelectTeam}>
                                            <BiPlusMedical /> Th??m ?????i nh??m <BiPlusMedical />
                                        </Button>
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>
                        <div className="card mb-4">
                            <div className="card-header">
                                <Form.Check type="switch" label="Cho ph??p ????ng nh???p" checked={employeeInfo.user.enableLogin} onChange={handleToggleLogin} />
                            </div>
                            <div className="card-body">
                                {employeeInfo.user.enableLogin ? (
                                    <>
                                        <div className="mb-4">
                                            <Form.Label htmlFor="username" className="mt-3">
                                                T??n ????ng nh???p:
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                placeholder="Nh???p t??n ????ng nh???p..."
                                                value={employeeInfo.user?.username || employeeInfo.email}
                                                onChange={handleUserChange}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">Vui l??ng nh???p t??n ????ng nh???p.</Form.Control.Feedback>
                                        </div>
                                        {(employee?.id && employee?.user.username === "" && employee?.user.password === "cmdcmdcmd") || !employee ? (
                                            <>
                                                <hr />
                                                <div className="mb-4">
                                                    <Form.Label htmlFor="password">M???t kh???u:</Form.Label>
                                                    <Form.Control type="text" name="password" placeholder="Nh???p m???t kh???u..." value={"cmdcmdcmd"} readOnly />
                                                    <Form.Control.Feedback type="invalid">Vui l??ng nh???p m???t kh???u.</Form.Control.Feedback>
                                                </div>
                                            </>
                                        ) : null}
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="mb-6" />
                    <Modal.Footer>
                        <Button type="submit" disabled={status === "sending"} className="d-flex align-items-center">
                            <span className="fw-bolder">{employee?.id ? "C???p nh???t" : "T???o sinh vi??n"}</span>
                            {status === "sending" && <Spinner as="span" animation="border" size="sm" className="ms-2" />}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

FormSubmitEmployee.propTypes = propTypes

export default FormSubmitEmployee