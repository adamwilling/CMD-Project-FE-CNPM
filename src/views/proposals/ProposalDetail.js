/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Col, Image, Modal, Row } from 'react-bootstrap'
import { BiSend } from 'react-icons/bi'
import Swal from 'sweetalert2'

import proposalsApi from '~/api/proposalsApi'
import { useDispatch, useSelector } from 'react-redux'
import { updateProposalList } from '~/redux/proposalsSlice'
import { authSelector } from '~/redux/selectors'

const propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    proposal: PropTypes.object,
    proposalId: PropTypes.number,
}

const ProposalDetail = ({ visible, setVisible, proposal, proposalId }) => {
    const userInfo = useSelector(authSelector).userInfo

    const dispatch = useDispatch()

    const [proposalInfo, setProposalInfo] = useState({})

    useEffect(() => {
        if (proposalId) {
            proposalsApi.getProposalDetailById(proposalId)
                .then((response) => {
                    setProposalInfo(response.data.data)
                })
        }
        if (proposal) {
            setProposalInfo(proposal)
        }
    }, [])

    const showDate = (d) => {
        const date = new Date(d)
        return "" + (date.getDate() < 10 ? "0" : "") + date.getDate() + "/" + (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1) + "/" + date.getFullYear()
    }

    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 10000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
    })
    const handleAcceptProposal = (proposalId) => {
        proposalsApi.acceptProposal(proposalId)
            .then((response) => {
                if (response.data.status === "OK") {
                    Toast.fire({
                        title: "Duy???t ????? xu???t",
                        text: response.data.message,
                        icon: "success"
                    })
                    setProposalInfo(response.data.data)
                    dispatch(updateProposalList(response.data.data))
                }
                else {
                    Toast.fire({
                        title: "Duy???t ????? xu???t",
                        text: response.data.message,
                        icon: "warning",
                    })
                }
            })
    }
    const handleDenyProposal = async (proposalId) => {
        setVisible(false)
        const { value: reason } = await Swal.fire({
            title: "T??? ch???i ????? xu???t",
            input: 'textarea',
            inputLabel: 'L?? do t??? ch???i',
            inputPlaceholder: 'Nh???p l?? do t??? ch???i...',
            inputAttributes: {
                'aria-label': 'Nh???p l?? do t??? ch???i'
            },
            showCancelButton: true
        })

        if (reason) {
            return proposalsApi.denyProposal({
                id: proposalId,
                reason: reason
            })
                .then((response) => {
                    if (response.data.status === "OK") {
                        Toast.fire({
                            title: "T??? ch???i ????? xu???t",
                            text: response.data.message,
                            icon: "success",
                        })
                        setProposalInfo(response.data.data)
                        dispatch(updateProposalList(response.data.data))
                    }
                    else {
                        Toast.fire({
                            title: "T??? ch???i ????? xu???t",
                            text: response.data.message,
                            icon: "warning",
                        })
                    }
                })
        }
    }

    return (
        <Modal
            className="modal-fullheight"
            size="lg"
            scrollable
            show={visible}
            onHide={() => setVisible(false)}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    Chi ti???t ????? xu???t
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex flex-column justify-content-between">
                    <div className="mb-4">
                        <div className="text-uppercase fw-bolder">
                            Th??ng tin ????? xu???t
                        </div>
                        <Row className="m-2">
                            <div className="col-4 fw-bolder">Ng?????i t???o:</div>
                            <div className="col-8">{proposalInfo.creator?.name}</div>
                        </Row>
                        <Row className="m-2">
                            <div className="col-4 fw-bolder">Ng??y t???o:</div>
                            <div className="col-8">{showDate(proposalInfo.createdDate)}</div>
                        </Row>
                        <Row className="m-2">
                            <div className="col-4 fw-bolder">Lo???i ????? xu???t:</div>
                            <div className="col-8">{proposalInfo.proposalType?.name}</div>
                        </Row>
                        <Row className="m-2">
                            <div className="col-4 fw-bolder">Tr???ng th??i:</div>
                            <div className="col-8 text-primary fw-bolder">
                                {proposalInfo.status?.name}
                            </div>
                        </Row>
                    </div>
                    <div className="mb-4">
                        <div className="text-uppercase fw-bolder">
                            N???i dung ????? xu???t
                        </div>
                        {
                            proposalInfo.contents?.map((content) => (
                                <Row key={content.fieldId} className="m-2">
                                    <div className="col-4 fw-bolder">{content.fieldName}:</div>
                                    <div className="col-8">
                                        {content.content}
                                    </div>
                                </Row>
                            ))
                        }
                    </div>
                    <Accordion defaultActiveKey={['0']}>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Th???o lu???n</Accordion.Header>
                            <Accordion.Body>
                                <div className="d-flex justify-content-evenly">
                                    <div className="col-auto">
                                        <Image
                                            className="rounded-circle me-2"
                                            src={"data:image/png;base64," + userInfo.avatar}
                                            width={35}
                                            height={35}
                                        />
                                    </div>
                                    <div className="col">
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Nh???p n???i dung th???o lu???n"
                                        />
                                    </div>
                                    <div className="col-auto ms-2">
                                        <BiSend size={35} />
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </Modal.Body>
            {proposalInfo.canApprove === true && proposalInfo.status?.id === 7 && (
                <>
                    <div className='mb-6' />
                    <Modal.Footer>
                        <Button
                            variant="success"
                            className="col-4 fw-bolder mx-2"
                            onClick={() => handleAcceptProposal(proposalInfo.id)}
                        >
                            Duy???t
                        </Button>
                        <Button
                            variant="danger"
                            className="col-4 fw-bolder mx-2"
                            onClick={() => handleDenyProposal((proposalInfo.id))}
                        >
                            T??? ch???i
                        </Button>
                    </Modal.Footer>
                </>
            )
            }
        </Modal>
    )
}


ProposalDetail.propTypes = propTypes

export default ProposalDetail