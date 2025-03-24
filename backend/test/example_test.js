const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Task = require('../models/Task'); // Import Task model
const { createTask, updateTask, getTasks, deleteTask } = require('../controllers/taskController'); // Import controller functions
const { expect } = chai;

describe('Task Controller Tests', () => {

    let createStub, findStub, findByIdStub, findByIdAndUpdateStub, findByIdAndDeleteStub;

    beforeEach(() => {
        createStub = sinon.stub(Task, 'create');
        findStub = sinon.stub(Task, 'find');
        findByIdStub = sinon.stub(Task, 'findById');
        findByIdAndUpdateStub = sinon.stub(Task, 'findByIdAndUpdate');
        findByIdAndDeleteStub = sinon.stub(Task, 'findByIdAndDelete');
    });

    afterEach(() => {
        createStub.restore();
        findStub.restore();
        findByIdStub.restore();
        findByIdAndUpdateStub.restore();
        findByIdAndDeleteStub.restore();
    });

    // 🟢 Test 1: Create Task Successfully
    it('should create a new task successfully', async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: { title: "New Task", description: "Task description", deadline: "2025-12-31" }
        };

        const createdTask = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };
        createStub.resolves(createdTask);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await createTask(req, res);

        expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(createdTask)).to.be.true;
    });

    // 🔴 Test 2: Task Creation Error
    it('should return 500 if an error occurs during task creation', async () => {
        createStub.throws(new Error('DB Error'));

        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: { title: "New Task", description: "Task description", deadline: "2025-12-31" }
        };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await createTask(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });

    // 🟢 Test 3: Update Task Successfully
    it('should update a task successfully', async () => {
        const req = { params: { id: '123' }, body: { title: "Updated Task" } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        findByIdAndUpdateStub.resolves(req.body);

        await updateTask(req, res);

        expect(findByIdAndUpdateStub.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith(req.body)).to.be.true;
    });

    // 🔴 Test 4: Update Task - Task Not Found
    it('should return 404 if task is not found during update', async () => {
        findByIdAndUpdateStub.resolves(null);

        const req = { params: { id: '123' }, body: { title: "Updated Task" } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await updateTask(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Task not found' })).to.be.true;
    });

    // 🔴 Test 5: Update Task - Database Error
    it('should return 500 on error during task update', async () => {
        findByIdAndUpdateStub.throws(new Error('DB Error'));

        const req = { params: { id: '123' }, body: { title: "Updated Task" } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await updateTask(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });

    // 🟢 Test 6: Get Tasks Successfully
    it('should return tasks for the given user', async () => {
        const req = { user: { id: "12345" } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        findStub.resolves([{ title: "Task 1" }]);

        await getTasks(req, res);

        expect(findStub.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith([{ title: "Task 1" }])).to.be.true;
    });

    // 🔴 Test 7: Get Tasks - Database Error
    it('should return 500 on error while fetching tasks', async () => {
        findStub.throws(new Error('DB Error'));

        const req = { user: { id: "12345" } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await getTasks(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });

    // 🟢 Test 8: Delete Task Successfully
    it('should delete a task successfully', async () => {
        findByIdAndDeleteStub.resolves(true);

        const req = { params: { id: '123' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteTask(req, res);

        expect(findByIdAndDeleteStub.calledOnce).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
    });

    // 🔴 Test 9: Delete Task - Task Not Found
    it('should return 404 if task is not found during deletion', async () => {
        findByIdAndDeleteStub.resolves(null);

        const req = { params: { id: '123' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteTask(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Task not found' })).to.be.true;
    });

    // 🔴 Test 10: Delete Task - Database Error
    it('should return 500 if an error occurs during deletion', async () => {
        findByIdAndDeleteStub.throws(new Error('DB Error'));

        const req = { params: { id: '123' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteTask(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });

});
