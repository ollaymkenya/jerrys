const Testimonial = require("../models/Testimonial");

exports.publishTestimonial = async (newTestimony) => {
    let testimonials = await Testimonial.find();
    class ListNode {
        constructor(data) {
            this.data = data
            this.next = null
        }
    }

    class LinkedList {
        constructor(head = null) {
            this.head = head
        }
    }

    let counter = 0;
    let node1, node2, node3
    let nodes = [node1, node2, node3];
    for (let i = 0; i < testimonials.length; i++) {
        if (testimonials[i].published === true) {
            nodes[counter] = new ListNode(testimonials[i]);
            counter++;
        }
    }

    nodes[0].next = nodes[1];
    nodes[1].next = nodes[2];

    let list = new LinkedList(nodes[0]);

    let lastTestimony;
    for (let current = list.head; current !== null; current = current.next) {
        if (current.next === null) {
            lastTestimony = current.data.id;
        }
    }

    Testimonial
        .findOne({
            _id: lastTestimony
        })
        .then((toBeRemoved) => {
            toBeRemoved.published = false;
            toBeRemoved
                .save()  
                .then(result => {
                    Testimonial.findOne({
                            _id: newTestimony
                        })
                        .then((toBeAdded) => {
                            toBeAdded.published = true;
                            toBeAdded
                                .save()
                                .then(result => {
                                    return result;
                                })
                        })
                        .catch(err => {
                            console.log(err);
                        })
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);
        })
}