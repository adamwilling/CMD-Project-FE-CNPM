import React, { useState } from "react"
import { Formik } from "formik"
import { Modal, Button, Form } from "react-bootstrap"
import * as Yup from "yup"
import clsx from "clsx"
import { addPost, addPostToList, updatePost, updatePostList } from "~/redux/postsSlice"
import postsApi from "../../../api/postsApi"
import { useDispatch } from "react-redux"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import Swal from "sweetalert2"
const refresh = {
    title: undefined,
    content: "",
    isPulished: true,
}
const FormSubmitPost = ({ visible, setVisible, post }) => {
    const dispatch = useDispatch()

    const [postInfo, setPostInfo] = useState(post || {
        title: "",
        content: "",
        isPublic: true
    })

    function uploadAdapter(loader) {
        const body = new FormData()
        return {
            upload: () => {
                return new Promise((resolve) => {
                    loader.file.then((file) => {
                        body.append("image", file)
                        return postsApi.uploadImages(body).then((q) => {
                            resolve({
                                default: `http://222.255.238.159:9090/api/get-image/${q.data.data.name}`,
                            })
                        })
                    })
                })
            },
        }
    }

    function uploadPlugin(editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
            return uploadAdapter(loader)
        }
    }
    const deletePlugin = (images) => {
        console.log(images)
    }

    const [validated, setValidated] = useState(false)
    const handleSubmit = (e) => {
        const form = e.currentTarget
        e.preventDefault()
        e.stopPropagation()
        setValidated(true)
        if (form.checkValidity() === true) {
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
            if (post?.id) {
                postsApi.updatePost(postInfo)
                    .then((response) => {
                        if (response.data.status === "OK") {
                            Toast.fire({
                                title: "Ch???nh s???a b??i vi???t",
                                text: response.data.message,
                                icon: "success",
                            })
                            dispatch(updatePostList(response.data.data))
                            setVisible(false)
                        }
                        else {
                            Toast.fire({
                                title: "Ch???nh s???a b??i vi???t",
                                text: response.data.message,
                                icon: "warning",
                            })
                        }
                    })
            }
            else {
                postsApi.addPost(postInfo)
                    .then((response) => {
                        if (response.data.status === "OK") {
                            Toast.fire({
                                title: "Th??m b??i vi???t",
                                text: response.data.message,
                                icon: "success",
                            })
                            dispatch(addPostToList(response.data.data))
                            setVisible(false)
                        }
                        else {
                            Toast.fire({
                                title: "Th??m b??i vi???t",
                                text: response.data.message,
                                icon: "warning",
                            })
                        }
                    })
            }
            setVisible(false)
        }
    }

    return (
        <Modal
            className="modal-fullheight"
            size="lg"
            scrollable
            backdrop="static"
            show={visible}
            onHide={() => setVisible(false)}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {post?.id ? "Ch???nh s???a b??i vi???t" : "????ng b??i vi???t"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form
                    validated={validated}
                    onSubmit={handleSubmit}
                >
                    <div className="mb-4">
                        <Form.Label>
                            Ti??u ????? b??i vi???t<span style={{ color: "red" }}>*</span>:
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            placeholder="Nh???p ti??u ????? b??i vi???t..."
                            value={postInfo.title}
                            onChange={(event) => {
                                setPostInfo({
                                    ...postInfo,
                                    title: event.target.value,
                                })
                            }}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Vui l??ng nh???p ti??u ?????.
                        </Form.Control.Feedback>
                    </div>
                    <div className="mb-4">
                        <Form.Label>
                            N???i dung<span style={{ color: "red" }}>*</span>:
                        </Form.Label>
                        <CKEditor
                            config={{
                                extraPlugins: [uploadPlugin],
                            }}
                            editor={ClassicEditor}
                            data={postInfo.content}
                            onChange={(event, editor) => {
                                const data = editor.getData()
                                // console.log(editor);
                                setPostInfo({ ...postInfo, content: data })
                                // console.log({ event, editor, data });
                            }}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Vui l??ng nh???p n???i dung.
                        </Form.Control.Feedback>
                    </div>
                    <div className="mb-6" />
                    <Modal.Footer>
                        <Button className="fw-bolder" type="submit">
                            {(post?.id) ? "C???p nh???t" : "????ng b??i vi???t"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

export default FormSubmitPost