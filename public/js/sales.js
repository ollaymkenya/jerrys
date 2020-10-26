const leanMoreButton = document.getElementById("learnMore");
const sales2 = document.getElementById("sales2");
const phoneImage = document.getElementById("phoneImage");

learnMore.addEventListener("click", () => {
  sales2.scrollIntoView();
});

class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor(head = null) {
    this.head = head;
  }

  async bringNext() {
    let nextNode = this.head;
    setInterval(() => {
      nextNode = nextNode.next;
      phoneImage.src = `/images/${nextNode.data}.png`;
    }, 3000);
  }
}

let image1 = new ListNode("phone1");
let image2 = new ListNode("phone2");
let image3 = new ListNode("phone3");
let image4 = new ListNode("phone4");
let image5 = new ListNode("phone5");
let image6 = new ListNode("phone6");
let image7 = new ListNode("phone7");

image1.next = image2;
image2.next = image3;
image3.next = image4;
image4.next = image5;
image5.next = image6;
image6.next = image7;
image7.next = image1;

let list = new LinkedList(image7);

list.bringNext();
